;
window.dom || (window.dom = (function () {
  return {
    find: function (selector, elt) {
      elt = elt || document;
      return elt.querySelector(selector);
    },
    findAll: function (selector, elt) {
      elt = elt || document;
      return asArray(elt.querySelectorAll(selector));
    },
    create: function (name, attributes, children) {
      var elt = document.createElement(name);
      for (var a in attributes) {
        elt[a] = attributes[a];
      }
      if (children !== undefined) {
        if (children instanceof Array) {
          children.forEach(function (node) {
            elt.appendChild(makeNode(node));
          });
        } else {
          elt.appendChild(makeNode(children));
        }
        function makeNode(data) {
          return (data instanceof Node) ? data : document.createTextNode(data);
        }
      }
      return elt;
    },
    toggleClass: function (name, elt, active) {
      (active === undefined) && (active = !elt.classList.contains(name));
      if (active) {
        elt.classList.add(name)
      } else {
        elt.classList.remove(name)
      }
    },
    hasClass: function (name, elt) {
      return elt.classList.contains(name)
    },
    prepend: function (target, elt) {
      if (target.children.length > 0) {
        target.insertBefore(elt, target.children[0])
      } else {
        target.appendChild(elt)
      }
    }
  };

  function asArray(nodelist) {
    var array = [];
    var length = nodelist.length;
    for (var i = 0 ; i < length ; i++) {
      array.push(nodelist[i]);
    }
    return array;
  }
})());