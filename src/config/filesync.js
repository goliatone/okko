'use strict';

const config = {
    exitIfMissingEntityFile: false,
    /**
     * Really simple mapping from:
     * entities.json -> entities -> entity
     * We are basically singularizing.
     * users.json -> users -> user
     * We could use a generic library
     * like "i" or "pluralize" but seems
     * bloated.
     *
     * @param  {String} entity
     * @param  {Object}              context
     * @return {String}        Filename and extension
     */
    getEntityNameFromFile: function(entity, context) {
        if(entity === 'users') return 'user';

        context.logger.warn('getEntityNameFromFile failed to find a valid mapping for %s.', entity);
        context.logger.warn('We will try to guess...');

        if(entity.charAt(entity.length - 1)){
            entity = entity.substring(0, entity.length - 1);
            context.logger.warn('We are removing the ending "s": %s.', entity);
            return entity;
        }

        context.logger.warn('We give up, returning entity as it was...');
        return entity;
    },
    /**
     * Simple mapping. No need to get fancy.
     *
     * @param  {String} entity
     * @param  {Object}              context
     * @return {String}        Filename and extension
     */
    getFilenameFromEntity: function(entity, context) {
        if(entity === 'user') return 'users.json';

        entity = entity + 's.json';

        context.logger.warn('getFilenameFromEntity failed to find a valid mapping for %s.', entity);
        context.logger.warn('We will try to guess it: %s', entity);

        return entity;
    },
    seed: {
        path: '${app.basepath}/data/seed',
        options:{
            depth: 0,
            //This will add a delay of 2s and 100ms polling
            awaitWriteFinish: true,
            //Ignore all dot files.
            ignored: /(^|[\/\\])\../
        },
        moveAfterDone: false,
        historyPath: '${app.basepath}/data/history'
    }
};

if(process.env.NODE_ENV === 'production') {
    config.seed.moveAfterDone = true;
    // config.remote.moveAfterDone = true;
}

/*
 * export config.
 */
module.exports = config;
