module.exports = Dom;

function Dom () { }

Dom.prototype.XMLHttpRequest = XMLHttpRequest;

Dom.prototype.getHTMLElement = function () {
  return document.getElementsByTagName('html')[0];
};

Dom.prototype.getBodyElement = function () {
  return document.body;
};

Dom.prototype.getElementById = function (id) {
  return document.getElementById(id);
};

Dom.prototype.getLocationHash = function () {
  return window.location.hash;
};

//FROM HOU: 페이지를 replaceState할 필요가 없음
Dom.prototype.setLocationHash = function (hash) {
  window.location.hash = hash;
  //if (typeof window.history.replaceState === 'function' && document.origin !== 'null') {
  //  window.history.replaceState(undefined, undefined, hash);
  //}
  //else {
  //  window.location.hash = hash;
  //}
};
