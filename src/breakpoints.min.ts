interface Breakpoints {
    [key: string]: string | string[];
  }
  
  interface Event {
    query: string;
    handler: () => void;
    state: boolean;
  }
  
  const breakpoints = (function() {
    "use strict";
  
    const t = {
      list: null as Breakpoints,
      media: {} as { [key: string]: boolean | string },
      events: [] as Event[],
      init: function(e: Breakpoints) {
        t.list = e;
        window.addEventListener("resize", t.poll);
        window.addEventListener("orientationchange", t.poll);
        window.addEventListener("load", t.poll);
        window.addEventListener("fullscreenchange", t.poll);
      },
      active: function(e: string) {
        let n: string, a: string, s: string, i: string, r: number, d: number, c: string;
        if (!(e in t.media)) {
          if (">=" == e.substr(0, 2)) {
            a = "gte";
            n = e.substr(2);
          } else if ("<=" == e.substr(0, 2)) {
            a = "lte";
            n = e.substr(2);
          } else if (">" == e.substr(0, 1)) {
            a = "gt";
            n = e.substr(1);
          } else if ("<" == e.substr(0, 1)) {
            a = "lt";
            n = e.substr(1);
          } else if ("!" == e.substr(0, 1)) {
            a = "not";
            n = e.substr(1);
          } else {
            a = "eq";
            n = e;
          }
  
          if (n && n in t.list) {
            const iValue = t.list[n];
            if (Array.isArray(iValue)) {
              r = parseInt(iValue[0]);
              d = parseInt(iValue[1]);
              if (isNaN(r)) {
                if (isNaN(d)) return;
                c = iValue[1].substr(String(d).length);
              } else {
                c = iValue[0].substr(String(r).length);
              }
  
              if (isNaN(r)) {
                switch (a) {
                  case "gte":
                    s = "screen";
                    break;
                  case "lte":
                    s = "screen and (max-width: " + d + c + ")";
                    break;
                  case "gt":
                    s = "screen and (min-width: " + (d + 1) + c + ")";
                    break;
                  case "lt":
                    s = "screen and (max-width: -1px)";
                    break;
                  case "not":
                    s = "screen and (min-width: " + (d + 1) + c + ")";
                    break;
                  default:
                    s = "screen and (max-width: " + d + c + ")";
                }
              } else if (isNaN(d)) {
                switch (a) {
                  case "gte":
                    s = "screen and (min-width: " + r + c + ")";
                    break;
                  case "lte":
                    s = "screen";
                    break;
                  case "gt":
                    s = "screen and (max-width: -1px)";
                    break;
                  case "lt":
                    s = "screen and (max-width: " + (r - 1) + c + ")";
                    break;
                  case "not":
                    s = "screen and (max-width: " + (r - 1) + c + ")";
                    break;
                  default:
                    s = "screen and (min-width: " + r + c + ")";
                }
              } else {
                switch (a) {
                  case "gte":
                    s = "screen and (min-width: " + r + c + ")";
                    break;
                  case "lte":
                    s = "screen and (max-width: " + d + c + ")";
                    break;
                  case "gt":
                    s = "screen and (min-width: " + (d + 1) + c + ")";
                    break;
                  case "lt":
                    s = "screen and (max-width: " + (r - 1) + c + ")";
                    break;
                  case "not":
                    s = "screen and (max-width: " + (r - 1) + c + "), screen and (min-width: " + (d + 1) + c + ")";
                    break;
                  default:
                    s = "screen and (min-width: " + r + c + ") and (max-width: " + d + c + ")";
                }
              }
            } else {
              s = "(" == iValue.charAt(0) ? "screen and " + iValue : iValue;
            }
            t.media[e] = !!s && s;
          }
        }
        return t.media[e] !== false && window.matchMedia(t.media[e]).matches;
      },
      on: function(e: string, n: () => void) {
        t.events.push({ query: e, handler: n, state: false });
        if (t.active(e)) n();
      },
      poll: function() {
        for (let e = 0; e < t.events.length; e++) {
          const n = t.events[e];
          if (t.active(n.query)) {
            if (!n.state) {
              n.state = true;
              n.handler();
            }
          } else if (n.state) {
            n.state = false;
          }
        }
      }
    };
  
    return {
      _: t,
      on: function(e: string, n: () => void) {
        t.on(e, n);
      },
      active: function(e: string) {
        return t.active(e);
      }
    };
  })();
  
  (function(e: any, t: any) {
    if (typeof define === "function" && define.amd) {
      define([], t);
    } else if (typeof exports === "object") {
      module.exports = t();
    } else {
      e.breakpoints = t();
    }
  })(this, function() {
    return breakpoints;
  });
  