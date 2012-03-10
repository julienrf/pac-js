;(function () {

  /**
   * Convenient function creating all known components
   * @param {Array} binders Array of binders objects
   * @param {Element=} root Element from which you want to bind your components
   */
  function bindAll(binders, root) {
    return binders.map(function (binder) {
      binder.bind(root)
    })
  }

  function binder(spec) {
    var that = object().mixin({
      bind: function (root, params) {
        var data = spec.bind(root);
        if (data === undefined) return;
        if (data.model) {
          data.model.id || (root.dataset.id && (data.model.id = root.dataset.id));
          // TODO if the id is set, look in a local object acting like a database to find an existing entry instead of creating it
        }
        var ctl = spec.control(dream.mixin({
          model: data.model,
          view: {
            type: spec.view,
            data: dream.mixin({ root: root }, data.view)
          }
        }, params));
        spec.callback && spec.callback(ctl, params); // TODO find a better name than “callback”
        return ctl;
      },
      bindAll: function (root, params) {
        return dom.findAll(spec.selector, root).map(function (elt) {
          return that.bind(elt, params)
        })
      }
    });
    return that
  }

  var binders = {
    empty: function () {
      return { view: {} };
    }
  };

  /**
   * Model definition
   * @param {Object} spec Hash with the following keys handled: defaults and mixin.
   */
  function model(spec) {
    var that = object().mixin(spec.mixin);
    forEachIn(spec.defaults, function (prop) {
      if (that[prop] === undefined) {
        that[prop] = spec.defaults[prop];
      }
    });

    that.assign = function (obj) {
      forEachIn(obj, function (prop) {
        if (!isFunction(obj[prop])) {
          that[prop] = obj[prop];
        }
      });
    };

    return that
  }

  /**
   * Control definition
   */
  function control(spec) {
    var that = object();
    
    if (spec) {
      that.mixin(spec.mixin);
      if (spec.view) {
        if(isFunction(spec.view)) { // { view: viewConstructor } => create the view
          that.view = spec.view({ control: that });
          that.view.create(spec.rootElt);
        } else if (isFunction(spec.view.type)) { // { view: { type: viewConstructor, data: { root: … } } } => bound view
          that.view = spec.view.type({ control: that });
          spec.view.data && that.view.mixin(spec.view.data);
        }
        that.view.bindEvents();
      }
    }

    that.proxify = function (model, proxies) {
      that.mixin(proxify(model, proxies));
    };

    return that;
  }

  /**
   * View definition
   * @param {Object} spec
   */
  function view(spec) {
    var that = object();

    that.control = spec.control;

    // FIXME Est-ce vraiment pertinent d’écrire cette abstraction sachant qu’elle ne fait pas grand chose
    // et, surtout, qu’elle force les views a avoir une property “root” de type Node
    that.append = function (other) {
      that.root.appendChild(other.root);
    };

    that.on = function (event, elt, callback) {
      elt.addEventListener(event, callback);
    };

    that.handler = function (callback) {
      return function (e) {
        e.preventDefault();
        callback(e);
        return false;
      };
    };

    that.bindEvents = function () {}; // Emtpy event declaration

    return that;
  }

  /**
   * Publish/Subscribe behavior
   * Add a `subscribe` and a `publish` methods to a given object.
   * @param {Object} that Object to be augmented with pub/sub features
   */
  function pubsub(that) {
    var subscribers = [];

    /**
     * Add a subscriber to that
     * @param {Object} subscriber
     */
    that.subscribe = function (subscriber) {
      subscribers.push(subscriber)
    };
    /**
     * Execute a function for all that’s subscribers
     * @param {Function} action
     */
    that.publish = subscribers.forEach.bind(subscribers);
  }

  /**
   * Base object definition
   * A trait has the ability to mix other traits in it.
   * TODO Have a spec parameter to allow to create an object with methods in just one call.
   * object({
   *   props: {
   *     foo: function () {
   *
   *     }
   *     get bar() {
   *       return this.foo() // Ahem. I mean that.foo(), obviously.
   *     }
   *   }
   * });
   * Anyway that’s cool to be able to add traits and properties after object creation so I shouldn’t drop the mixin and using methods, so is there any interest in having the ability to set mixins from the constructor?
   */
  function object() {
    var that = {};
    Object.defineProperties(that, {
      /**
       * Mix that trait properties in that trait
       * @param {...Object} sources Objects to mix in that trait
       * @return {Object} that trait
       */
      mixin: {
        value: function(sources) {
          return mixin.apply(null, Array.prototype.concat.apply([that], arguments));
        }
      },
      /**
       * @param {Function(Object->Object)...} arguments Traits to be used in that object
       */
      using: {
        value: function () {
          Array.prototype.forEach.call(arguments, function (trait) {
            trait(that);
          });
          return that;
        }
      },
      /**
       * Allow to retrieve the nearest parent’s method before overriding it
       * @param method
       */
      parent: {
        value: function (method) {
          var that = this;
          return function () {
            return that[method].apply(that, arguments);
          }
        }
      }
    });
    return that
  }

  /*
    // Customize the proxy: customProxy will copy every method of model, but aMethod will have the customized implementation
    var customProxy = dream.proxify(model, {
      aMethod: function (delegate) {
        return function () {
          delegate.apply(null, arguments);
          customProxy.foo = 'bar';
          that.view.update();
        };
      }
    });

    // Proxies can be chained: complexProxy contains all methods of customProxy, plus the custom aMethod which will call the one defined in customProxy (which itself proxies the one of model)
    var complexProxy = dream.proxify(customProxy, {
      aMethod: function (delegate) {
        return function () {
          ajax.call({
            url: 'web-service'
          });
          delegate.apply(null, arguments);
        };
      }
    });

    // In one statement:
    var complexProxy2 = dream.proxify(model, { // First level
      aMethod: function (delegate) {
        return function () {
          delegate.apply(null, arguments);
          that.view.update();
        };
      }
    }, { // Second level (will be executed first)
      aMethod: function (delegate) {
        return function () {
          ajax.call({ url: 'web-service' });
          delegate.apply(null, arguments);
        };
      }
    });

    // Or shorter:
    var complexProxy3 = dream.proxify(model, {
      aMethod: after(that.view.update)
    }, {
      aMethod: dream.proxy.before(function () {
        ajax.call({ url: 'web-service' });
      })
    });

    // Or even that?
    var complexProxy4 = dream.proxify(model, {
      aMethod: function (delegate) {
        ajax.call({
          url: 'web-service',
          success: function (data) {
            that.mixin(data); // This mixing process must be done using the proxy setters
            that.view.update();
          }
        });
        delegate.apply(null, arguments);
        that.view.update();
      }
    });

    // Typical usage:
    that.proxify(model, ajaxProxy(model, ajaxActions)); // ajaxActions can be generated by the server!
  */

  /**
   * Create a proxy of an object
   * @param {Object} obj Object to be proxyfied
   * @param {Object} proxies Custom proxies definitions. A proxy has type {Function -> Function}: it accepts the delegate function as arguments and returns the new function to be used instead of this delegate
   * @return The created proxy
   */
  function proxify(obj, proxies) {
    var that = {};
    proxies || (proxies = {});
    forEachIn(obj, function (prop) {
      if (isFunction(obj[prop])) {
        that[prop] = isFunction(proxies[prop]) ? proxies[prop](obj[prop]) : obj[prop]
      } else {
        (function (prop) {
          Object.defineProperty(that, prop, {
            enumerable: true,
            get: proxies[prop] && isFunction(proxies[prop].get) ? proxies[prop].get(obj) : function () { return obj[prop] },
            set: proxies[prop] && isFunction(proxies[prop].set) ? proxies[prop].set(obj) : function (value) { obj[prop] = value; return value }
          })
        })(prop);
      }
    });
    return that
  }

  var proxies = {
    /**
     * Combinator returning a proxy generator, calling a given callback after the delegate function has been called
     * @param {Function} callback
     * @return {Function} The proxy generator
     */
    after: function (callback) {
      return function (delegate) {
        // Proxy definition: call the delegate function then the callback
        return function () {
          delegate.apply(null, arguments);
          callback.apply(null, arguments);
        }
      }
    },

    /**
     * Combinator returning a proxy generator, calling a given callback before calling the delegate function
     * @param {Function} callback
     * @return {Function} The proxy generator
     */
    before: function (callback) {
      return function (delegate) {
        // Proxy definition: call the callback then the delegate function
        return function () {
          callback.apply(null, arguments);
          delegate.apply(null, arguments);
        }
      }
    },

    /**
     *
     */
    _ajax: function (spec) {
      return function (delegate) {
        return function () {
          var settings = {
            action: spec.action(),
            type: 'json'
          };
          for (var key in ['data', 'success', 'error']) {
            spec[key] && (settings[key] = spec[key])
          }
          spec.before && spec.before();
          ajax.call(settings);
          delegate.apply(null, arguments);
          spec.after && spec.after();
        }
      }
    },
    
    ajax: function (spec) {
      return proxies._ajax({
        action: spec.action,
        after: function () {
          spec.control().view.update()
        },
        success: function (data) {
          spec.control().assign(data);
          spec.control().view.update()
        }
      })
    }
  };


  /**
   * Helper to copy enumerable properties of an object to another
   * @param {Object} target Object to update. If undefined an empty trait will be created
   * @param {...Object} sources Source objects to be merged in the target object
   * @return {Object} The modified target object
   * TODO Handle getters and setters
   */
  function mixin(target, sources) {
    target = target || {};
    if (sources) {
      sources = Array.prototype.slice.call(arguments, 1);
      sources.forEach(function (source) {
        forEachIn(source, function (prop) {
          Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
        });
      });
    }
    return target;
  }

  // Does it work silently when object is undefined?
  function forEachIn(object, callback) {
    for (var p in object) {
      callback(p);
    }
  }

  // Could be replaced with _.isFunction
  function isFunction (value) {
    return typeof value == 'function';
  }

  window.dream || (window.dream = {
    binder: binder,
    bindAll: bindAll,
    model: model,
    control: control,
    view: view,
    object: object,
    pubsub: pubsub,
    proxify: proxify,
    proxies: proxies,
    binders: binders,
    mixin: mixin
  });

})();
