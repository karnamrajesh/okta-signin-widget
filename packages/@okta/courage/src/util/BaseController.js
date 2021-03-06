/* eslint max-params: [2, 6], max-len: [2, 150] */
define([
  'okta/jquery',
  'okta/underscore',
  'shared/views/BaseView',
  'shared/util/StateMachine',
  'shared/util/SettingsModel',
  'shared/util/BaseRouter'
],
function ($, _, BaseView, StateMachine, SettingsModel, BaseRouter) {

  function clean(obj) {
    var res = {};
    _.each(obj, function (value, key) {
      if (!_.isNull(value)) {
        res[key] = value;
      }
    });
    return res;
  }

  /**
   * A Controller is our application control flow component.
   *
   * Typically it will:
   * - Initialize the models, controller and main views
   * - Listen to events
   * - Create, read, update and delete models
   * - Create modal dialogs, confirmation dialogs and alert dialogs
   * - Control the application flow
   *
   * The constructor is responsible for:
   * - Create the application state object
   * - Assign or creates the application settings object
   * - Create an instance of the main view with the relevant parameters
   *
   * See:
   * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
   * [Jasmine Spec](https://github.com/okta/okta-core/blob/master/WebContent/js/test/unit/spec/shared/util/BaseController_spec.js)
   *
   * @class module:Okta.Controller
   * @param {Object} options Options Hash
   * @param {SettingsModel} [options.settings] Application Settings Model
   * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
   */
  return BaseView.extend(/** @lends module:Okta.Controller.prototype */{

    constructor: function (options) {
      /* eslint max-statements: [2, 13], complexity: [2, 7]*/
      options || (options = {});

      var stateData = _.defaults(clean(options.state), this.state || {});
      this.state = new StateMachine(stateData);
      delete options.state;

      if (options.settings) {
        this.settings = options.settings;
      }
      else { // allow the controller to live without a router
        this.settings = options.settings = new SettingsModel(_.omit(options || {}, 'el'));
        this.listen('notification', BaseRouter.prototype._notify);
        this.listen('confirmation', BaseRouter.prototype._confirm);
      }

      BaseView.call(this, options);

      this.listenTo(this.state, '__invoke__', function () {
        var args = _.toArray(arguments),
            method = args.shift();
        if (_.isFunction(this[method])) {
          this[method].apply(this, args);
        }
      });


      if (this.View) {
        this.add(new this.View(this.toJSON()));
      }
    },

    /**
     * The default values of our application state
     * @type {Object}
     * @default {}
     */
    state: {},


    /**
     * The main view this controller operate on
     * @type {module:Okta.View}
     * @default null
     */
    View: null,

    /**
     * Renders the {@link module:Okta.Controller#View|main view} after the DOM is ready
     * in case the controller is the root component of the page (e.g there's no router)
     */
    render: function () {
      var args = arguments,
          self = this;
      $(function () {
        BaseView.prototype.render.apply(self, args);
      });
      return this;
    },

    /**
     * Creates the view constructor options
     * @param {Object} [options] Extra options
     * @return {Object} The view constructor options
     */
    toJSON: function (options) {
      return _.extend(_.pick(this, 'state', 'settings', 'collection', 'model'), options || {});
    },

    /**
     * Removes the child views, empty the DOM element and stop listening to events
     */
    remove: function () {
      this.removeChildren();
      this.stopListening();
      this.$el.empty();
      return this;
    }

  });

});
