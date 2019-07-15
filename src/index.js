'use strict';

const Application = require('application-core').Application;

let config = Application.loadConfig({});

let app = new Application({
    config
});

/**
 * Once the application has bootstraped
 * then we can start the application.
 * - coreplugins.ready (commands and plugins not loaded)
 * - modules.ready
 * - commands.ready
 */
app.once('modules.ready', () => {
    app.run();
});

app.once('modules.resolved', _ => {
    const style = {
        __meta__: {
            style: 'bold+white+magenta_bg'
        }
    };
    app.logger.info('Server available at "%s:%s"', app.server.config.host, app.server.config.port, style);
});