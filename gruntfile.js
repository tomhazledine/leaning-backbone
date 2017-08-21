module.exports = function(grunt){
    
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.initConfig({
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'assets/js/lib',
                    paths: {
                        app: '../app'
                    },
                    map: {
                        '*': {
                            'masterapp': 'app/app',
                            'underscore': 'underscore',
                            'backbone': 'backbone',
                            'marionette': 'backbone.marionette'
                        }
                    },
                    // name: 'path/to/almond',
                    include: [ '../app/main.js' ],
                    out: 'assets/app.js'
                }
            }
        }
      
    });

    grunt.registerTask('build',['requirejs']);

    grunt.registerTask('default','build');
}