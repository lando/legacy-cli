const debug = require('debug')('lando:@lando/cli:hooks:init');
const fs = require('fs');
const path = require('path');

const {Flags, Parser} = require('@oclif/core');

module.exports = async ({id, argv, config}) => {
  // before we begin lets check some requirements out
  await config.runHook('init-preflight', {id, argv, config});

  // preemptively do a basic check for the config flag
  const {flags} = await Parser.parse(argv, {strict: false, flags: {config: Flags.string({
    char: 'c',
    description: 'use configuration from specified file',
    env: 'LANDO_CONFIG_FILE',
    default: undefined,
    helpGroup: 'GLOBAL',
  })}});

  // debug if flag config file doesnt exist
  // @NOTE: should this be a proper error?
  if (flags.config && !fs.existsSync(flags.config)) {
    debug('tried to load %s into config but it doesnt exist', flags.config);
  }

  // start the lando config by setting the default bootstrapper and its config
  const systemTemplate = path.join(__dirname, '..', 'config', 'system.js');
  const userTemplate = path.join(__dirname, '..', 'config', 'user.yaml');
  const minstrapper = {
    // config: {},
    loader: path.join(__dirname, '..', 'node_modules', '@lando', 'core-next', 'core', 'bootstrap.js'),
    config: {
      cached: path.join(config.cacheDir, 'config.json'),
      env: 'LANDO',
      id: 'lando',
      managed: 'global',
      // add oclif config so we can use it in our js templates
      oclif: config,
      // sources are loading in increasing priority into the main config
      sources: {
        system: path.join(config.dataDir, 'system.json'),
        global: path.join(config.dataDir, 'global.json'),
        user: path.join(config.configDir, 'config.yaml'),
        overrides: flags.config && fs.existsSync(flags.config) ? path.resolve(flags.config) : undefined,
      },
      // templates can prepopulate or override sources before they are loaded
      templates: {
        system: {source: systemTemplate, dest: path.join(config.dataDir, 'system.json'), replace: true},
        global: {data: {}, dest: path.join(config.dataDir, 'global.json')},
        user: {source: userTemplate, dest: path.join(config.configDir, 'config.yaml')},
      },
    },
  };

  // minstrap hook
  //
  // @NOTE: the minstrapper is a lightweight thing that loads the main bootstrapper. it exists primarily so that
  // lando can be modified at a very core level. this is useful if you want to distribute your own lando
  // with a different name, config set, and different "pre command" runtime.
  //
  // to that end you will want to add an OCLIF plugin and hook into the "minstrapper" event. you can replace the
  // minstrapper there. note that your event will have access to both config and lando
  //
  await config.runHook('init-setup', {minstrapper, config});
  debug('init-setup complete, using %o as bootstrapper', minstrapper.loader);

  // get the boostrapper and run it
  const Bootstrapper = require(minstrapper.loader);
  const bootstrap = new Bootstrapper(minstrapper.config, config.cli);

  // Initialize
  try {
    await bootstrap.run(config);
    debug('init-setup completed successfully!');
  } catch (error) {
    console.error('Bootstrap failed!'); // eslint-disable-line no-console
    config.hookError(error);
  }

  // hook to modify the config
  await config.runHook('init-config', {id, argv, config});

  // determine if we have an app or not
  const {lando, cli} = config;
  const landofile = lando.config.get('core.landofile');
  const landofiles = [`${landofile}.yaml`, `${landofile}.yml`];
  const landofilePath = lando.findApp(landofiles, process.cwd());

  // if we have an file then lets set some things in the config for downstream purposes
  if (fs.existsSync(landofilePath)) {
    const MinApp = lando.getClass('app.minapp');
    const app = new MinApp({landofile: landofilePath, config: lando.config.getUncoded(), plugins: lando.getPlugins()});
    // set and report
    config.app = app;
    debug('discovered an app called %o at %o', config.app.name, path.dirname(landofilePath));
    // a special event that runs only when we have an app
    await config.runHook('init-app', {id, argv, config});
  }

  // determine the context
  config.context = {app: config.app !== undefined, global: config.app === undefined};
  debug('command is running with context %o', config.context);

  // get the stuff we just made to help us get the tasks
  const {app, context} = config;
  // get legacy tasks from the appropriate registry
  const registry = context.app ? app.getRegistry() : lando.getRegistry();
  config.tasks = Object.entries(registry.legacy.tasks)
    .map(([name, file]) => ({name, file}))
    .filter(task => fs.existsSync(`${task.file}.js`))
    .map(task => require(task.file)(lando, cli));

  // if we do the above then we should have what we need in lando.registry or app.registry
  await config.runHook('init-tasks', {id, argv, tasks: config.tasks});

  // final hook to do stuff to the init
  await config.runHook('init-final', config);
};