var generators = require('yeoman-generator');

module.exports = generators.Base.extend({

    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    prompting: function () {
        var prompts = [
        {
            type    : 'input',
            name    : 'projectname',
            message : 'What is the name of your project?',
            default : this.appname // Defaults to the current folder name.
        },
        {
            type    : 'checkbox',
            name    : 'features',
            message : 'Which optional features do you want to install?',
            choices : [
                {
                    name    : 'castlecss-buttons',
                    checked : true
                },
                {
                    name    : 'castlecss-notifications',
                    checked : true
                }
            ]
        },
        {
            type    : 'list',
            name    : 'buildsystem',
            message : 'Which build system would you like to use?',
            choices : [
                'gulp',
                'grunt',
                'none'
            ]
        }];

        return this.prompt(prompts).then(function (answers) {
            
            this.projectname = answers.projectname;
            this.buildsystem = answers.buildsystem;

            function hasFeature(feat) {
                return answers.features && answers.features.indexOf(feat) !== -1;
            }

            this.includeButtons = hasFeature('castlecss-buttons');
            this.includeNotifications = hasFeature('castlecss-notifications');

        }.bind(this));

    },

    writing: function () {
        this.fs.copyTpl(
            this.templatePath('_package.json'),
            this.destinationPath('package.json'), 
            { projectname: this.projectname }
        );

        this.fs.copyTpl(
            this.templatePath('scss/_main.scss'),
            this.destinationPath('scss/main.scss'),
            {
                includeButtons: this.includeButtons,
                includeNotifications: this.includeNotifications,
                castleCssCorePath: 'node_modules/castlecss-core',
                castleCssButtonsPath: 'node_modules/castlecss-buttons',
                castleCssNotificationsPath: 'node_modules/castlecss-notifications'
            }
        );

        this.fs.copy(
            this.templatePath('scss/variables.scss'),
            this.destinationPath('scss/variables.scss')  
        );

        switch (this.buildsystem) {
            case 'gulp': 
                this.fs.copy(
                    this.templatePath('gulpfile.js'),
                    this.destinationPath('gulpfile.js')  
                );
                break;
            case 'grunt':
                this.fs.copy(
                    this.templatePath('Gruntfile.js'),
                    this.destinationPath('Gruntfile.js')
                );
                break;
        }
    },

    install: function () {
        this.npmInstall(['castlecss-core'], { 'save-dev': true });
        
        if (this.includeButtons) {
            this.npmInstall(['castlecss-buttons'], { 'save-dev': true });
        }

        if (this.includeNotifications) {
            this.npmInstall(['castlecss-notifications'], { 'save-dev': true });
        }
    }
});