var generators = require('yeoman-generator');

function containsValue(array, value) {
  return array && array.indexOf(value) !== -1;
}

module.exports = generators.Base.extend({

  constructor: function () {
    generators.Base.apply(this, arguments);
    this.option('projectname', {
      type: String,
      required: false,
      desc: "Name of the project."
    });
    this.option('features', {
      type: String,
      required: false,
      desc: "Comma-seperated list of optional features. Possible values: castlecss-options, castlecss-notifications"
    });
    this.option('buildsystem', {
      type: String,
      required: false,
      desc: "The build system to use. Possible values: grunt, gulp, none"
    });
  },

  prompting: function () {

    var prompts = [];

    // Only prompt if the value hasn't been passed as a command line option.
    if (!this.options['projectname']) {
      prompts.push({
        type: 'input',
        name: 'projectname',
        message: 'What is the name of your project?',
        default: this.appname // Defaults to the current folder name.
      });
    }
    else {
      this.projectname = this.options['projectname'];
    }

    if (!this.options['features']) {
      prompts.push({
        type: 'checkbox',
        name: 'features',
        message: 'Which optional features do you want to install?',
        choices: [
          {
            name: 'castlecss-buttons',
            checked: true
          },
          {
            name: 'castlecss-notifications',
            checked: true
          }
        ]
      });
    }
    else {
      var features = this.options['features'].split(',');
      this.includeButtons = containsValue(features, 'castlecss-buttons');
      this.includeNotifications = containsValue(features, 'castlecss-notifications');
    }

    if (!this.options['buildsystem']) {
      prompts.push({
        type: 'list',
        name: 'buildsystem',
        message: 'Which build system would you like to use?',
        choices: [
          'gulp',
          'grunt',
          'none'
        ]
      });
    }
    else {
      this.buildsystem = this.options['buildsystem'];
    }
    return this.prompt(prompts).then(function (answers) {
      if (!this.projectname) {
        this.projectname = answers.projectname;
      }

      if (!this.buildsystem) {
        this.buildsystem = answers.buildsystem;
      }

      if (!this.includeButtons) {
        this.includeButtons = containsValue(answers.features, 'castlecss-buttons');
      }

      if (!this.includeNotifications) {
        this.includeNotifications = containsValue(answers.features, 'castlecss-notifications');
      }
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