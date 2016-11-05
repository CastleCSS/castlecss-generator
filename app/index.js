var generators = require('yeoman-generator');

module.exports = generators.Base.extend({

    constructor: function () {
        generators.Base.apply(this, arguments);
    },

    prompting: function () {
        var prompts = [{
            type    : 'input',
            name    : 'projectname',
            message : 'What is the name of your project?',
            default : this.appname // Defaults to the current folder name.
        },
        {
            type    : 'list',
            name    : 'buildsystem',
            message : 'Which build system would you like to use?',
            choices: [
                'gulp',
                'grunt',
                'none'
            ]
        }];

        return this.prompt(prompts).then(function (answers) {
            this.projectname = answers.projectname;
            this.buildsystem = answers.buildsystem;
        }.bind(this));

    },

    writing: function () {
        this.fs.copyTpl(
            this.templatePath('_package.json'),
            this.destinationPath('package.json'), 
            { projectname: this.projectname }
        );

        this.fs.copyTpl(
            this.templatePath('scss/main.scss'),
            this.destinationPath('scss/main.scss'),
            {
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
        this.npmInstall(['castlecss'], { 'save-dev': true });
    }
});