;
window.ajax = window.ajax || (function () {
  var ajax = {};

  ajax.call = function (spec) {

    var xhr = new XMLHttpRequest();
    var contentTypes = {
      'xml': 'text/xml',
      'html': 'text/html',
      'json': 'application/json',
      'text': 'text/plain'
    };
    var textParser = function (xhr) { return xhr.responseText };
    var dataParsers = {
      'xml': function (xhr) { return xhr.responseXML; },
      'html': textParser,
      'json': function (xhr) { return JSON.parse(xhr.responseText); },
      'text': textParser
    };

    spec = spec || {};
    spec.configure && spec.configure(xhr);

    xhr.open(spec.method || (spec.action && spec.action.method) || 'GET', spec.url || (spec.action && spec.action.url));

    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        spec.complete && spec.complete();
        switch (Math.floor(xhr.status / 100)) {
          case 2:
          case 3:
            if (spec.success) {
              var data = (dataParsers[spec.type] || textParser)(xhr);
              spec.success(data, xhr);
            }
            break;
          default:
            spec.error && spec.error(xhr.responseText, xhr);
            break;
        }
      }
    };

    spec.progress && (xhr.onprogress = spec.progress);

    var data = spec.data ? ajax.toQueryString(spec.data) : null;

    contentTypes[spec.type] && xhr.setRequestHeader('Accept', contentTypes[spec.type]);

    xhr.send(data);
  };

  // Stolen from reqwest.js
  ajax.toQueryString = function (o) {
    var qs = '', i
      , enc = encodeURIComponent
      , push = function (k, v) {
          qs += enc(k) + '=' + enc(v) + '&'
        };

    if (Array.isArray(o)) {
      for (i = 0; o && i < o.length; i++) push(o[i].name, o[i].value);
    } else {
      for (var k in o) {
        if (!Object.hasOwnProperty.call(o, k)) continue;
        var v = o[k];
        if (Array.isArray(v)) {
          for (i = 0; i < v.length; i++) {
            push(k, v[i]);
          }
        } else {
          push(k, o[k]);
        }
      }
    }
    return qs.replace(/&$/, '').replace(/%20/g,'+')
  };

  return ajax;
})();