const $ = new compatibility();
const donate =
  "alipays://platformapi/startapp?appId=10000009&url=/www/stepDonate.htm?chInfo=antsports&sourceName=antsports";

$.notify("支付宝", "", "捐步数啦", donate);

$done();

function compatibility() {
  _isQuanX = typeof $task != "undefined";
  _isLoon = typeof $loon != "undefined";
  _isSurge = typeof $httpClient != "undefined" && !_isLoon;
  this.read = (key) => {
    if (_isQuanX) return $prefs.valueForKey(key);
    if (_isLoon) return $persistentStore.read(key);
  };
  this.notify = (title, subtitle, message, url) => {
    if (_isLoon) $notification.post(title, subtitle, message, url);
    if (_isQuanX) $notify(title, subtitle, message, { "open-url": url });
    if (_isSurge) $notification.post(title, subtitle, message, { url: url });
  };
}
