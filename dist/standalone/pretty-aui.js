import { $ as e, A as t, At as n, B as r, C as i, D as a, E as o, Et as s, F as c, Ft as l, G as u, H as d, I as f, It as p, J as m, K as h, L as g, M as _, N as v, O as y, Ot as b, P as x, Q as S, R as ee, S as C, T as te, U as w, V as ne, W as re, X as ie, Y as ae, Z as oe, _ as se, a as ce, at as le, b as ue, c as de, ct as fe, d as pe, dt as T, et as me, f as he, ft as ge, g as _e, gt as ve, h as ye, ht as be, i as xe, it as Se, j as E, jt as Ce, k as D, l as we, lt as Te, m as Ee, mt as De, n as Oe, nt as ke, o as Ae, ot as je, p as Me, pt as Ne, q as Pe, r as Fe, rt as Ie, s as Le, st as Re, t as ze, tt as Be, u as Ve, ut as He, v as Ue, w as We, x as Ge, y as Ke, z as qe } from "./chunks/types.js";
//#region node_modules/.pnpm/preact@10.29.8/node_modules/preact/dist/preact.module.js
var Je, O, Ye, Xe, Ze, Qe, $e, et, tt, k, nt, rt, it, at, ot, st = {}, ct = [], lt = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, ut = Array.isArray;
function A(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}
function dt(e) {
	e && e.parentNode && e.parentNode.removeChild(e);
}
function j(e, t, n) {
	var r, i, a, o = {};
	for (a in t) a == "key" ? r = t[a] : a == "ref" ? i = t[a] : o[a] = t[a];
	if (arguments.length > 2 && (o.children = arguments.length > 3 ? Je.call(arguments, 2) : n), typeof e == "function" && e.defaultProps != null) for (a in e.defaultProps) o[a] === void 0 && (o[a] = e.defaultProps[a]);
	return ft(e, o, r, i, null);
}
function ft(e, t, n, r, i) {
	var a = {
		type: e,
		props: t,
		key: n,
		ref: r,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: i ?? ++Ye,
		__i: -1,
		__u: 0
	};
	return i == null && O.vnode != null && O.vnode(a), a;
}
function pt(e) {
	return e.children;
}
function M(e, t) {
	this.props = e, this.context = t;
}
function mt(e, t) {
	if (t == null) return e.__ ? mt(e.__, e.__i + 1) : null;
	for (var n; t < e.__k.length; t++) if ((n = e.__k[t]) != null && n.__e != null) return n.__e;
	return typeof e.type == "function" ? mt(e) : null;
}
function ht(e) {
	if (e.__P && e.__d) {
		var t = e.__v, n = t.__e, r = [], i = [], a = A({}, t);
		a.__v = t.__v + 1, O.vnode && O.vnode(a), Dt(e.__P, a, t, e.__n, e.__P.namespaceURI, 32 & t.__u ? [n] : null, r, n ?? mt(t), !!(32 & t.__u), i), a.__v = t.__v, a.__.__k[a.__i] = a, kt(r, a, i), t.__e = t.__ = null, a.__e != n && gt(a);
	}
}
function gt(e) {
	if ((e = e.__) != null && e.__c != null) return e.__e = e.__c.base = null, e.__k.some(function(t) {
		if (t != null && t.__e != null) return e.__e = e.__c.base = t.__e;
	}), gt(e);
}
function _t(e) {
	(!e.__d && (e.__d = !0) && Xe.push(e) && !vt.__r++ || Ze != O.debounceRendering) && ((Ze = O.debounceRendering) || Qe)(vt);
}
function vt() {
	try {
		for (var e, t = 1; Xe.length;) Xe.length > t && Xe.sort($e), e = Xe.shift(), t = Xe.length, ht(e);
	} finally {
		Xe.length = vt.__r = 0;
	}
}
function yt(e, t, n, r, i, a, o, s, c, l, u) {
	var d, f, p, m, h, g, _ = r && r.__k || ct, v = t.length;
	for (c = bt(n, t, _, c, v), d = 0; d < v; d++) (p = n.__k[d]) != null && (f = p.__i != -1 && _[p.__i] || st, p.__i = d, g = Dt(e, p, f, i, a, o, s, c, l, u), m = p.__e, p.ref && f.ref != p.ref && (f.ref && Mt(f.ref, null, p), u.push(p.ref, p.__c || m, p)), h == null && m != null && (h = m), 4 & p.__u ? (c = xt(p, c, e), f.__e && (f.__e = null)) : typeof p.type == "function" && g !== void 0 ? c = g : m && (c = m.nextSibling), p.__u &= -7);
	return n.__e = h, c;
}
function bt(e, t, n, r, i) {
	var a, o, s, c, l, u = n.length, d = u, f = 0;
	for (e.__k = Array(i), a = 0; a < i; a++) (o = t[a]) != null && typeof o != "boolean" && typeof o != "function" ? (typeof o == "string" || typeof o == "number" || typeof o == "bigint" || o.constructor == String ? o = e.__k[a] = ft(null, o, null, null, null) : ut(o) ? o = e.__k[a] = ft(pt, { children: o }, null, null, null) : o.constructor === void 0 && o.__b > 0 ? o = e.__k[a] = ft(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : e.__k[a] = o, c = a + f, o.__ = e, o.__b = e.__b + 1, s = null, (l = o.__i = Ct(o, n, c, d)) != -1 && (d--, (s = n[l]) && (s.__u |= 2)), s == null || s.__v == null ? (l == -1 && (i > u ? f-- : i < u && f++), typeof o.type != "function" && (o.__u |= 4)) : l != c && (l == c - 1 ? f-- : l == c + 1 ? f++ : (l > c ? f-- : f++, o.__u |= 4))) : e.__k[a] = null;
	if (d) for (a = 0; a < u; a++) (s = n[a]) != null && !(2 & s.__u) && (s.__e == r && (r = mt(s)), Nt(s, s));
	return r;
}
function xt(e, t, n) {
	var r, i;
	if (typeof e.type == "function") {
		for (r = e.__k, i = 0; r && i < r.length; i++) r[i] && (r[i].__ = e, t = xt(r[i], t, n));
		return t;
	}
	e.__e != t && (t && e.type && !t.parentNode && (t = mt(e)), t = n.insertBefore(e.__e, t || null));
	do
		t &&= t.nextSibling;
	while (t != null && t.nodeType == 8);
	return t;
}
function St(e, t) {
	return t ||= [], e == null || typeof e == "boolean" || (ut(e) ? e.some(function(e) {
		St(e, t);
	}) : t.push(e)), t;
}
function Ct(e, t, n, r) {
	var i, a, o, s = e.key, c = e.type, l = t[n], u = l != null && !(2 & l.__u);
	if (l === null && s == null || u && s == l.key && c == l.type) return n;
	if (r > +!!u) {
		for (i = n - 1, a = n + 1; i >= 0 || a < t.length;) if ((l = t[o = i >= 0 ? i-- : a++]) != null && !(2 & l.__u) && s == l.key && c == l.type) return o;
	}
	return -1;
}
function wt(e, t, n) {
	t[0] == "-" ? e.setProperty(t, n ?? "") : e[t] = n == null ? "" : typeof n != "number" || lt.test(t) ? n : n + "px";
}
function Tt(e, t, n, r, i) {
	var a, o;
	n: if (t == "style") {
		if (typeof n == "string") e.style.cssText = n;
		else {
			if (typeof r == "string" && (e.style.cssText = r = ""), r) for (t in r) n && t in n || wt(e.style, t, "");
			if (n) for (t in n) r && n[t] == r[t] || wt(e.style, t, n[t]);
		}
	} else if (t[0] == "o" && t[1] == "n") a = t != (t = t.replace(nt, "$1")), o = t.toLowerCase(), t = o in e || t == "onFocusOut" || t == "onFocusIn" ? o.slice(2) : t.slice(2), e.l ||= {}, e.l[t + a] = n, n ? r ? n[k] = r[k] : (n[k] = rt, e.addEventListener(t, a ? at : it, a)) : e.removeEventListener(t, a ? at : it, a);
	else {
		if (i == "http://www.w3.org/2000/svg") t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if (t != "width" && t != "height" && t != "href" && t != "list" && t != "form" && t != "tabIndex" && t != "download" && t != "rowSpan" && t != "colSpan" && t != "role" && t != "popover" && t in e) try {
			e[t] = n ?? "";
			break n;
		} catch {}
		typeof n == "function" || (n == null || !1 === n && t[4] != "-" ? e.removeAttribute(t) : e.setAttribute(t, t == "popover" && n == 1 ? "" : n));
	}
}
function Et(e) {
	return function(t) {
		if (this.l) {
			var n = this.l[t.type + e];
			if (t[tt] == null) t[tt] = rt++;
			else if (t[tt] < n[k]) return;
			return n(O.event ? O.event(t) : t);
		}
	};
}
function Dt(e, t, n, r, i, a, o, s, c, l) {
	var u, d, f, p, m, h, g, _, v, y, b, x, S, ee, C, te, w = t.type;
	if (t.constructor !== void 0) return null;
	128 & n.__u && (c = !!(32 & n.__u), a = [s = t.__e = n.__e]), (u = O.__b) && u(t);
	n: if (typeof w == "function") {
		d = o.length;
		try {
			if (v = t.props, y = w.prototype && w.prototype.render, b = (u = w.contextType) && r[u.__c], x = u ? b ? b.props.value : u.__ : r, n.__c ? _ = (f = t.__c = n.__c).__ = f.__E : (y ? t.__c = f = new w(v, x) : (t.__c = f = new M(v, x), f.constructor = w, f.render = Pt), b && b.sub(f), f.state || (f.state = {}), f.__n = r, p = f.__d = !0, f.__h = [], f._sb = []), y && f.__s == null && (f.__s = f.state), y && w.getDerivedStateFromProps != null && (f.__s == f.state && (f.__s = A({}, f.__s)), A(f.__s, w.getDerivedStateFromProps(v, f.__s))), m = f.props, h = f.state, f.__v = t, p) y && w.getDerivedStateFromProps == null && f.componentWillMount != null && f.componentWillMount(), y && f.componentDidMount != null && f.__h.push(f.componentDidMount);
			else {
				if (y && w.getDerivedStateFromProps == null && v !== m && f.componentWillReceiveProps != null && f.componentWillReceiveProps(v, x), t.__v == n.__v || !f.__e && f.shouldComponentUpdate != null && !1 === f.shouldComponentUpdate(v, f.__s, x)) {
					t.__v != n.__v && (f.props = v, f.state = f.__s, f.__d = !1), t.__e = n.__e, t.__k = n.__k, t.__k.some(function(e) {
						e && (e.__ = t);
					}), ct.push.apply(f.__h, f._sb), f._sb = [], f.__h.length && o.push(f), s = mt(n);
					break n;
				}
				f.componentWillUpdate != null && f.componentWillUpdate(v, f.__s, x), y && f.componentDidUpdate != null && f.__h.push(function() {
					f.componentDidUpdate(m, h, g);
				});
			}
			if (f.context = x, f.props = v, f.__P = e, f.__e = !1, S = O.__r, ee = 0, y) f.state = f.__s, f.__d = !1, S && S(t), u = f.render(f.props, f.state, f.context), ct.push.apply(f.__h, f._sb), f._sb = [];
			else do
				f.__d = !1, S && S(t), u = f.render(f.props, f.state, f.context), f.state = f.__s;
			while (f.__d && ++ee < 25);
			f.state = f.__s, f.getChildContext != null && (r = A(A({}, r), f.getChildContext())), y && !p && f.getSnapshotBeforeUpdate != null && (g = f.getSnapshotBeforeUpdate(m, h)), C = u != null && u.type === pt && u.key == null ? At(u.props.children) : u, s = yt(e, ut(C) ? C : [C], t, n, r, i, a, o, s, c, l), f.base = t.__e, t.__u &= -161, f.__h.length && o.push(f), _ && (f.__E = f.__ = null);
		} catch (e) {
			if (o.length = d, t.__v = null, c || a != null) {
				if (e.then) {
					for (t.__u |= c ? 160 : 128; s && s.nodeType == 8 && s.nextSibling;) s = s.nextSibling;
					a != null && (a[a.indexOf(s)] = null), t.__e = s;
				} else if (a != null) for (te = a.length; te--;) dt(a[te]);
			} else t.__e = n.__e;
			t.__k ??= n.__k || [], e.then || Ot(t), O.__e(e, t, n);
		}
	} else a == null && t.__v == n.__v ? (t.__k = n.__k, t.__e = n.__e) : s = t.__e = jt(n.__e, t, n, r, i, a, o, c, l);
	return (u = O.diffed) && u(t), 128 & t.__u ? void 0 : s;
}
function Ot(e) {
	e && (e.__c && (e.__c.__e = !0), e.__k && e.__k.some(Ot));
}
function kt(e, t, n) {
	for (var r = 0; r < n.length; r++) Mt(n[r], n[++r], n[++r]);
	O.__c && O.__c(t, e), e.some(function(t) {
		try {
			e = t.__h, t.__h = [], e.some(function(e) {
				e.call(t);
			});
		} catch (e) {
			O.__e(e, t.__v);
		}
	});
}
function At(e) {
	return typeof e != "object" || !e || e.__b > 0 ? e : ut(e) ? e.map(At) : e.constructor === void 0 ? A({}, e) : null;
}
function jt(e, t, n, r, i, a, o, s, c) {
	var l, u, d, f, p, m, h, g = n.props || st, _ = t.props, v = t.type;
	if (v == "svg" ? i = "http://www.w3.org/2000/svg" : v == "math" ? i = "http://www.w3.org/1998/Math/MathML" : i ||= "http://www.w3.org/1999/xhtml", a != null) {
		for (l = 0; l < a.length; l++) if ((p = a[l]) && "setAttribute" in p == !!v && (v ? p.localName == v : p.nodeType == 3)) {
			e = p, a[l] = null;
			break;
		}
	}
	if (e == null) {
		if (v == null) return document.createTextNode(_);
		e = document.createElementNS(i, v, _.is && _), s &&= (O.__m && O.__m(t, a), !1), a = null;
	}
	if (v == null) g === _ || s && e.data == _ || (e.data = _);
	else {
		if (a = v == "textarea" && _.defaultValue != null ? null : a && Je.call(e.childNodes), !s && a != null) for (g = {}, l = 0; l < e.attributes.length; l++) g[(p = e.attributes[l]).name] = p.value;
		for (l in g) p = g[l], l == "dangerouslySetInnerHTML" ? d = p : l == "children" || l in _ || l == "value" && "defaultValue" in _ || l == "checked" && "defaultChecked" in _ || Tt(e, l, null, p, i);
		for (l in _) p = _[l], l == "children" ? f = p : l == "dangerouslySetInnerHTML" ? u = p : l == "value" ? m = p : l == "checked" ? h = p : s && typeof p != "function" || g[l] === p || Tt(e, l, p, g[l], i);
		if (u) s || d && (u.__html == d.__html || u.__html == e.innerHTML) || (e.innerHTML = u.__html), t.__k = [];
		else if (d && (e.innerHTML = ""), yt(t.type == "template" ? e.content : e, ut(f) ? f : [f], t, n, r, v == "foreignObject" ? "http://www.w3.org/1999/xhtml" : i, a, o, a ? a[0] : n.__k && mt(n, 0), s, c), a != null) for (l = a.length; l--;) dt(a[l]);
		s && v != "textarea" || (l = "value", v == "progress" && m == null ? e.removeAttribute("value") : m != null && (m !== e[l] || v == "progress" && !m || v == "option" && m != g[l]) && Tt(e, l, m, g[l], i), l = "checked", h != null && h != e[l] && Tt(e, l, h, g[l], i));
	}
	return e;
}
function Mt(e, t, n) {
	try {
		if (typeof e == "function") {
			var r = typeof e.__u == "function";
			r && e.__u(), r && t == null || (e.__u = e(t));
		} else e.current = t;
	} catch (e) {
		O.__e(e, n);
	}
}
function Nt(e, t, n) {
	var r, i;
	if (O.unmount && O.unmount(e), (r = e.ref) && (r.current && r.current != e.__e || Mt(r, null, t)), (r = e.__c) != null) {
		if (r.componentWillUnmount) try {
			r.componentWillUnmount();
		} catch (e) {
			O.__e(e, t);
		}
		r.base = r.__P = r.__n = null;
	}
	if (r = e.__k) for (i = 0; i < r.length; i++) r[i] && Nt(r[i], t, n || typeof e.type != "function");
	n || dt(e.__e), e.__c = e.__ = e.__e = void 0;
}
function Pt(e, t, n) {
	return this.constructor(e, n);
}
function Ft(e, t, n) {
	var r, i, a, o;
	t == document && (t = document.documentElement), O.__ && O.__(e, t), i = (r = typeof n == "function") ? null : n && n.__k || t.__k, a = [], o = [], Dt(t, e = (!r && n || t).__k = j(pt, null, [e]), i || st, st, t.namespaceURI, !r && n ? [n] : i ? null : t.firstChild ? Je.call(t.childNodes) : null, a, !r && n ? n : i ? i.__e : t.firstChild, r, o), kt(a, e, o), e.props.children = null;
}
function It(e) {
	function t(e) {
		var n, r;
		return this.getChildContext || (n = /* @__PURE__ */ new Set(), (r = {})[t.__c] = this, this.getChildContext = function() {
			return r;
		}, this.componentWillUnmount = function() {
			n = null;
		}, this.shouldComponentUpdate = function(e) {
			this.props.value != e.value && n.forEach(function(e) {
				e.__e = !0, _t(e);
			});
		}, this.sub = function(e) {
			n.add(e);
			var t = e.componentWillUnmount;
			e.componentWillUnmount = function() {
				n && n.delete(e), t && t.call(e);
			};
		}), e.children;
	}
	return t.__c = "__cC" + ot++, t.__ = e, t.Provider = t.__l = (t.Consumer = function(e, t) {
		return e.children(t);
	}).contextType = t, t;
}
Je = ct.slice, O = { __e: function(e, t, n, r) {
	for (var i, a, o; t = t.__;) if ((i = t.__c) && !i.__) try {
		if ((a = i.constructor) && a.getDerivedStateFromError != null && (i.setState(a.getDerivedStateFromError(e)), o = i.__d), i.componentDidCatch != null && (i.componentDidCatch(e, r || {}), o = i.__d), o) return i.__E = i;
	} catch (t) {
		e = t;
	}
	throw e;
} }, Ye = 0, M.prototype.setState = function(e, t) {
	var n = this.__s != null && this.__s != this.state ? this.__s : this.__s = A({}, this.state);
	typeof e == "function" && (e = e(A({}, n), this.props)), e && A(n, e), e != null && this.__v && (t && this._sb.push(t), _t(this));
}, M.prototype.forceUpdate = function(e) {
	this.__v && (this.__e = !0, e && this.__h.push(e), _t(this));
}, M.prototype.render = pt, Xe = [], Qe = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $e = function(e, t) {
	return e.__v.__b - t.__v.__b;
}, vt.__r = 0, et = Math.random().toString(8), tt = "__d" + et, k = "__a" + et, nt = /(PointerCapture)$|Capture$/i, rt = 0, it = Et(!1), at = Et(!0), ot = 0;
//#endregion
//#region node_modules/.pnpm/preact@10.29.8/node_modules/preact/hooks/dist/hooks.module.js
var Lt, N, Rt, zt, Bt = 0, Vt = [], P = O, Ht = P.__b, Ut = P.__r, Wt = P.diffed, Gt = P.__c, Kt = P.unmount, qt = P.__;
function Jt(e, t) {
	P.__h && P.__h(N, e, Bt || t), Bt = 0;
	var n = N.__H || (N.__H = {
		__: [],
		__h: []
	});
	return e >= n.__.length && n.__.push({}), n.__[e];
}
function Yt(e) {
	return Bt = 1, Xt(un, e);
}
function Xt(e, t, n) {
	var r = Jt(Lt++, 2);
	if (r.t = e, !r.__c && (r.__ = [n ? n(t) : un(void 0, t), function(e) {
		var t = r.__N ? r.__N[0] : r.__[0], n = r.t(t, e);
		t !== n && (r.__N = [n, r.__[1]], r.__c.setState({}));
	}], r.__c = N, !N.__f)) {
		var i = function(e, t, n) {
			if (!r.__c.__H) return !0;
			var i = !1, o = r.__c.props !== e;
			if (r.__c.__H.__.some(function(e) {
				if (e.__N) {
					i = !0;
					var t = e.__[0];
					e.__ = e.__N, e.__N = void 0, t !== e.__[0] && (o = !0);
				}
			}), a) {
				var s = a.call(this, e, t, n);
				return i ? s || o : s;
			}
			return !i || o;
		};
		N.__f = !0;
		var a = N.shouldComponentUpdate, o = N.componentWillUpdate;
		N.componentWillUpdate = function(e, t, n) {
			if (this.__e) {
				var r = a;
				a = void 0, i(e, t, n), a = r;
			}
			o && o.call(this, e, t, n);
		}, N.shouldComponentUpdate = i;
	}
	return r.__N || r.__;
}
function Zt(e, t) {
	var n = Jt(Lt++, 3);
	!P.__s && ln(n.__H, t) && (n.__ = e, n.u = t, N.__H.__h.push(n));
}
function Qt(e, t) {
	var n = Jt(Lt++, 4);
	!P.__s && ln(n.__H, t) && (n.__ = e, n.u = t, N.__h.push(n));
}
function F(e) {
	return Bt = 5, $t(function() {
		return { current: e };
	}, []);
}
function $t(e, t) {
	var n = Jt(Lt++, 7);
	return ln(n.__H, t) && (n.__ = e(), n.__H = t, n.__h = e), n.__;
}
function en(e, t) {
	return Bt = 8, $t(function() {
		return e;
	}, t);
}
function tn(e) {
	var t = N.context[e.__c], n = Jt(Lt++, 9);
	return n.c = e, t ? (n.__ ?? (n.__ = !0, t.sub(N)), t.props.value) : e.__;
}
function nn() {
	var e = Jt(Lt++, 11);
	if (!e.__) {
		for (var t = N.__v; t !== null && !t.__m && t.__ !== null;) t = t.__;
		var n = t.__m || (t.__m = [0, 0]);
		e.__ = "P" + n[0] + "-" + n[1]++;
	}
	return e.__;
}
function rn() {
	for (var e; e = Vt.shift();) {
		var t = e.__H;
		if (e.__P && t) try {
			t.__h.some(sn), t.__h.some(cn), t.__h = [];
		} catch (n) {
			t.__h = [], P.__e(n, e.__v);
		}
	}
}
P.__b = function(e) {
	N = null, Ht && Ht(e);
}, P.__ = function(e, t) {
	e && t.__k && t.__k.__m && (e.__m = t.__k.__m), qt && qt(e, t);
}, P.__r = function(e) {
	Ut && Ut(e), Lt = 0;
	var t = (N = e.__c).__H;
	t && (Rt === N ? (t.__h = [], N.__h = [], t.__.some(function(e) {
		e.__N && (e.__ = e.__N), e.u = e.__N = void 0;
	})) : (t.__h.some(sn), t.__h.some(cn), t.__h = [], Lt = 0)), Rt = N;
}, P.diffed = function(e) {
	Wt && Wt(e);
	var t = e.__c;
	t && t.__H && (t.__H.__h.length && (Vt.push(t) !== 1 && zt === P.requestAnimationFrame || ((zt = P.requestAnimationFrame) || on)(rn)), t.__H.__.some(function(e) {
		e.u &&= (e.__H = e.u, void 0);
	})), Rt = N = null;
}, P.__c = function(e, t) {
	t.some(function(e) {
		try {
			e.__h.some(sn), e.__h = e.__h.filter(function(e) {
				return !e.__ || cn(e);
			});
		} catch (n) {
			t.some(function(e) {
				e.__h &&= [];
			}), t = [], P.__e(n, e.__v);
		}
	}), Gt && Gt(e, t);
}, P.unmount = function(e) {
	Kt && Kt(e);
	var t, n = e.__c;
	n && n.__H && (n.__H.__.some(function(e) {
		try {
			sn(e);
		} catch (e) {
			t = e;
		}
	}), n.__H = void 0, t && P.__e(t, n.__v));
};
var an = typeof requestAnimationFrame == "function";
function on(e) {
	var t, n = function() {
		clearTimeout(r), an && cancelAnimationFrame(t), setTimeout(e);
	}, r = setTimeout(n, 35);
	an && (t = requestAnimationFrame(n));
}
function sn(e) {
	var t = N, n = e.__c;
	typeof n == "function" && (e.__c = void 0, n()), N = t;
}
function cn(e) {
	var t = N;
	e.__c = e.__(), N = t;
}
function ln(e, t) {
	return !e || e.length !== t.length || t.some(function(t, n) {
		return t !== e[n];
	});
}
function un(e, t) {
	return typeof t == "function" ? t(e) : t;
}
//#endregion
//#region node_modules/.pnpm/preact@10.29.8/node_modules/preact/compat/dist/compat.module.js
function dn(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}
function fn(e, t) {
	for (var n in e) if (n !== "__source" && !(n in t)) return !0;
	for (var r in t) if (r !== "__source" && e[r] !== t[r]) return !0;
	return !1;
}
function pn(e, t) {
	var n = t(), r = Yt({ t: {
		__: n,
		u: t
	} }), i = r[0].t, a = r[1];
	return Qt(function() {
		i.__ = n, i.u = t, mn(i) && a({ t: i });
	}, [
		e,
		n,
		t
	]), Zt(function() {
		return mn(i) && a({ t: i }), e(function() {
			mn(i) && a({ t: i });
		});
	}, [e]), n;
}
function mn(e) {
	try {
		return !((t = e.__) === (n = e.u()) && (t !== 0 || 1 / t == 1 / n) || t != t && n != n);
	} catch {
		return !0;
	}
	var t, n;
}
function hn(e, t) {
	this.props = e, this.context = t;
}
function gn(e, t) {
	function n(e) {
		var n = this.props.ref;
		return n != e.ref && n && (typeof n == "function" ? n(null) : n.current = null), t ? !t(this.props, e) || n != e.ref : fn(this.props, e);
	}
	function r(t) {
		return this.shouldComponentUpdate = n, j(e, t);
	}
	return r.displayName = "Memo(" + (e.displayName || e.name) + ")", r.__f = r.prototype.isReactComponent = !0, r.type = e, r;
}
(hn.prototype = new M()).isPureReactComponent = !0, hn.prototype.shouldComponentUpdate = function(e, t) {
	return fn(this.props, e) || fn(this.state, t);
};
var _n = O.__b;
O.__b = function(e) {
	e.type && e.type.__f && e.ref && (e.props.ref = e.ref, e.ref = null), _n && _n(e);
}, typeof Symbol < "u" && Symbol.for;
var vn = O.__e;
O.__e = function(e, t, n, r) {
	if (e.then) {
		for (var i, a = t; a = a.__;) if ((i = a.__c) && i.__c) return t.__e ?? (t.__e = n.__e, t.__k = n.__k || []), i.__c(e, t);
	}
	vn(e, t, n, r);
};
var yn = O.unmount;
function bn(e, t, n) {
	return e && (e.__c && e.__c.__H && (e.__c.__H.__.forEach(function(e) {
		typeof e.__c == "function" && e.__c();
	}), e.__c.__H = null), (e = dn({}, e)).__c != null && (e.__c.__P === n && (e.__c.__P = t), e.__c.__e = !0, e.__c = null), e.__k = e.__k && e.__k.map(function(e) {
		return bn(e, t, n);
	})), e;
}
function xn(e, t, n) {
	return e && n && (e.__v = null, e.__k = e.__k && e.__k.map(function(e) {
		return xn(e, t, n);
	}), e.__c && e.__c.__P === t && (e.__e && n.appendChild(e.__e), e.__c.__e = !0, e.__c.__P = n)), e;
}
function Sn() {
	this.__u = 0, this.o = null, this.__b = null;
}
function Cn(e) {
	var t = e.__ && e.__.__c;
	return t && t.__a && t.__a(e);
}
function wn() {
	this.i = null, this.l = null;
}
O.unmount = function(e) {
	var t = e.__c;
	t && (t.__z = !0), t && t.__R && t.__R(), t && 32 & e.__u && (e.type = null), yn && yn(e);
}, (Sn.prototype = new M()).__c = function(e, t) {
	var n = t.__c, r = this;
	r.o ??= [], r.o.push(n);
	var i = Cn(r.__v), a = !1, o = function() {
		a || r.__z || (a = !0, n.__R = null, i ? i(c) : c());
	};
	n.__R = o;
	var s = n.__P;
	n.__P = null;
	var c = function() {
		if (!--r.__u) {
			if (r.state.__a) {
				var e = r.state.__a;
				r.__v.__k[0] = xn(e, e.__c.__P, e.__c.__O);
			}
			var t;
			for (r.setState({ __a: r.__b = null }); t = r.o.pop();) t.__P = s, t.forceUpdate();
		}
	};
	r.__u++ || 32 & t.__u || r.setState({ __a: r.__b = r.__v.__k[0] }), e.then(o, o);
}, Sn.prototype.componentWillUnmount = function() {
	this.o = [];
}, Sn.prototype.render = function(e, t) {
	if (this.__b) {
		if (this.__v.__k) {
			var n = document.createElement("div"), r = this.__v.__k[0].__c;
			this.__v.__k[0] = bn(this.__b, n, r.__O = r.__P);
		}
		this.__b = null;
	}
	var i = t.__a && j(pt, null, e.fallback);
	return i && (i.__u &= -33), [j(pt, null, t.__a ? null : e.children), i];
};
var Tn = function(e, t, n) {
	if (++n[1] === n[0] && e.l.delete(t), e.props.revealOrder && (e.props.revealOrder[0] !== "t" || !e.l.size)) for (n = e.i; n;) {
		for (; n.length > 3;) n.pop()();
		if (n[1] < n[0]) break;
		e.i = n = n[2];
	}
};
(wn.prototype = new M()).__a = function(e) {
	var t = this, n = Cn(t.__v), r = t.l.get(e);
	return r[0]++, function(i) {
		var a = function() {
			t.props.revealOrder ? (r.push(i), Tn(t, e, r)) : i();
		};
		n ? n(a) : a();
	};
}, wn.prototype.render = function(e) {
	this.i = null, this.l = /* @__PURE__ */ new Map();
	var t = St(e.children);
	e.revealOrder && e.revealOrder[0] === "b" && t.reverse();
	for (var n = t.length; n--;) this.l.set(t[n], this.i = [
		1,
		0,
		this.i
	]);
	return e.children;
}, wn.prototype.componentDidUpdate = wn.prototype.componentDidMount = function() {
	var e = this;
	this.l.forEach(function(t, n) {
		Tn(e, n, t);
	});
};
var En = typeof Symbol < "u" && Symbol.for && Symbol.for("react.element") || 60103, Dn = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, On = /^on(Ani|Tra|Tou|BeforeInp|Compo)/, kn = /[A-Z0-9]/g, An = typeof document < "u", jn = function(e) {
	return (typeof Symbol < "u" && typeof Symbol() == "symbol" ? /fil|che|rad/ : /fil|che|ra/).test(e);
};
function Mn(e, t, n) {
	return t.__k ?? (t.textContent = ""), Ft(e, t), typeof n == "function" && n(), e ? e.__c : null;
}
M.prototype.isReactComponent = !0, [
	"componentWillMount",
	"componentWillReceiveProps",
	"componentWillUpdate"
].forEach(function(e) {
	Object.defineProperty(M.prototype, e, {
		configurable: !0,
		get: function() {
			return this["UNSAFE_" + e];
		},
		set: function(t) {
			Object.defineProperty(this, e, {
				configurable: !0,
				writable: !0,
				value: t
			});
		}
	});
});
var Nn = O.event;
O.event = function(e) {
	return Nn && (e = Nn(e)), e.persist = function() {}, e.isPropagationStopped = function() {
		return this.cancelBubble;
	}, e.isDefaultPrevented = function() {
		return this.defaultPrevented;
	}, e.nativeEvent = e;
};
var Pn = {
	configurable: !0,
	get: function() {
		return this.class;
	}
}, Fn = O.vnode;
O.vnode = function(e) {
	typeof e.type == "string" && function(e) {
		var t = e.props, n = e.type, r = {}, i = n.indexOf("-") == -1;
		for (var a in t) {
			var o = t[a];
			if (!(a === "value" && "defaultValue" in t && o == null || An && a === "children" && n === "noscript" || a === "class" || a === "className")) {
				var s = a.toLowerCase();
				a === "defaultValue" && "value" in t && t.value == null ? a = "value" : a === "download" && !0 === o ? o = "" : s === "translate" && o === "no" ? o = !1 : s[0] === "o" && s[1] === "n" ? s === "ondoubleclick" ? a = "ondblclick" : s !== "onchange" || n !== "input" && n !== "textarea" || jn(t.type) ? s === "onfocus" ? a = "onfocusin" : s === "onblur" ? a = "onfocusout" : On.test(a) && (a = s) : s = a = "oninput" : i && Dn.test(a) ? a = a.replace(kn, "-$&").toLowerCase() : o === null && (o = void 0), s === "oninput" && r[a = s] && (a = "oninputCapture"), r[a] = o;
			}
		}
		n == "select" && (r.multiple && Array.isArray(r.value) && (r.value = St(t.children).forEach(function(e) {
			e.props.selected = r.value.indexOf(e.props.value) != -1;
		})), r.defaultValue != null && (r.value = St(t.children).forEach(function(e) {
			e.props.selected = r.multiple ? r.defaultValue.indexOf(e.props.value) != -1 : r.defaultValue == e.props.value;
		}))), t.class && !t.className ? (r.class = t.class, Object.defineProperty(r, "className", Pn)) : t.className && (r.class = r.className = t.className), e.props = r;
	}(e), e.$$typeof = En, Fn && Fn(e);
};
var In = O.__r;
O.__r = function(e) {
	In && In(e), e.__c;
};
var Ln = O.diffed;
O.diffed = function(e) {
	Ln && Ln(e);
	var t = e.props, n = e.__e;
	n != null && e.type === "textarea" && "value" in t && t.value !== n.value && (n.value = t.value == null ? "" : t.value);
};
function Rn(e) {
	return !!e.__k && (Ft(null, e), !0);
}
//#endregion
//#region node_modules/.pnpm/preact@10.29.8/node_modules/preact/compat/client.mjs
function zn(e) {
	return {
		render: function(t) {
			Mn(t, e);
		},
		unmount: function() {
			Rn(e);
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/schema/index.js
var I = {
	initialize: "initialize",
	authenticate: "authenticate",
	providers_list: "providers/list",
	providers_set: "providers/set",
	providers_disable: "providers/disable",
	session_new: "session/new",
	session_load: "session/load",
	session_set_mode: "session/set_mode",
	session_set_config_option: "session/set_config_option",
	session_prompt: "session/prompt",
	session_cancel: "session/cancel",
	mcp_message: "mcp/message",
	session_list: "session/list",
	session_delete: "session/delete",
	session_fork: "session/fork",
	session_resume: "session/resume",
	session_close: "session/close",
	logout: "logout",
	nes_start: "nes/start",
	nes_suggest: "nes/suggest",
	nes_accept: "nes/accept",
	nes_reject: "nes/reject",
	nes_close: "nes/close",
	document_did_open: "document/didOpen",
	document_did_change: "document/didChange",
	document_did_close: "document/didClose",
	document_did_save: "document/didSave",
	document_did_focus: "document/didFocus"
}, L = {
	session_request_permission: "session/request_permission",
	session_update: "session/update",
	fs_write_text_file: "fs/write_text_file",
	fs_read_text_file: "fs/read_text_file",
	terminal_create: "terminal/create",
	terminal_output: "terminal/output",
	terminal_release: "terminal/release",
	terminal_wait_for_exit: "terminal/wait_for_exit",
	terminal_kill: "terminal/kill",
	mcp_connect: "mcp/connect",
	mcp_message: "mcp/message",
	mcp_disconnect: "mcp/disconnect",
	elicitation_create: "elicitation/create",
	elicitation_complete: "elicitation/complete"
}, Bn = { cancel_request: "$/cancel_request" }, Vn = 10, Hn = class {
	#e = [];
	push(e) {
		let t = [], n = 0, r = e.indexOf(Vn, n);
		for (; r !== -1;) t.push(this.#t(e.subarray(n, r))), n = r + 1, r = e.indexOf(Vn, n);
		return n < e.byteLength && this.#e.push(n === 0 ? e : new Uint8Array(e.subarray(n))), t;
	}
	flush() {
		if (this.#e.length !== 0) return this.#t(/* @__PURE__ */ new Uint8Array());
	}
	#t(e) {
		if (this.#e.length === 0) return e;
		let t = e.byteLength;
		for (let e of this.#e) t += e.byteLength;
		let n = new Uint8Array(t), r = 0;
		for (let e of this.#e) n.set(e, r), r += e.byteLength;
		return n.set(e, r), this.#e = [], n;
	}
};
qe.and(b({ mode: s("form") })).and(b({ message: n() })), d.and(b({ mode: s("url") })).and(b({ message: n() })), Ce([ne, r]).and(b({ message: n() })), ge.and(b({ type: s("string") })), e.and(b({ type: s("number") })), u.and(b({ type: s("integer") })), We.and(b({ type: s("boolean") })), oe.and(b({ type: s("array") })), T.and(b({ type: s("string") })), ee.and(b({ action: s("accept") })), b({ action: s("decline") }), b({ action: s("cancel") });
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/acp.js
function R(e) {
	return e ?? {};
}
function Un(e) {
	return typeof e == "object" && !!e && "readable" in e && "writable" in e;
}
function Wn() {
	let e = new TransformStream(), t = new TransformStream();
	return [{
		readable: t.readable,
		writable: e.writable
	}, {
		readable: e.readable,
		writable: t.writable
	}];
}
var z = {
	agent: {
		initialize: I.initialize,
		authenticate: I.authenticate,
		logout: I.logout,
		providers: {
			list: I.providers_list,
			set: I.providers_set,
			disable: I.providers_disable
		},
		session: {
			new: I.session_new,
			load: I.session_load,
			list: I.session_list,
			delete: I.session_delete,
			fork: I.session_fork,
			resume: I.session_resume,
			close: I.session_close,
			setMode: I.session_set_mode,
			setConfigOption: I.session_set_config_option,
			prompt: I.session_prompt,
			cancel: I.session_cancel
		},
		nes: {
			start: I.nes_start,
			suggest: I.nes_suggest,
			accept: I.nes_accept,
			reject: I.nes_reject,
			close: I.nes_close
		},
		document: {
			didOpen: I.document_did_open,
			didChange: I.document_did_change,
			didClose: I.document_did_close,
			didSave: I.document_did_save,
			didFocus: I.document_did_focus
		}
	},
	client: {
		session: {
			requestPermission: L.session_request_permission,
			update: L.session_update
		},
		fs: {
			writeTextFile: L.fs_write_text_file,
			readTextFile: L.fs_read_text_file
		},
		terminal: {
			create: L.terminal_create,
			output: L.terminal_output,
			release: L.terminal_release,
			waitForExit: L.terminal_wait_for_exit,
			kill: L.terminal_kill
		},
		elicitation: {
			create: L.elicitation_create,
			complete: L.elicitation_complete
		}
	},
	protocol: { cancelRequest: Bn.cancel_request }
}, Gn = Symbol("startActiveSession"), Kn = class {
	cx;
	currentRequestId;
	constructor(e, t) {
		this.cx = e, this.currentRequestId = t;
	}
	get requestId() {
		return this.currentRequestId;
	}
	get connectionContext() {
		return this.cx;
	}
	sendRequest(e, t, n, r) {
		return this.cx.sendRequest(e, t, n, r);
	}
	sendNotification(e, t) {
		return this.cx.sendNotification(e, t);
	}
	addDynamicHandler(e) {
		return this.cx.addDynamicHandler(e);
	}
}, qn = class e extends Kn {
	constructor(e, t) {
		super(e, t);
	}
	static create(t, n) {
		return new e(t, n);
	}
	request(e, t, n) {
		let r = mr[e];
		return this.sendRequest(e, t, r?.mapResponse, n);
	}
	notify(e, t) {
		return this.sendNotification(e, t);
	}
}, Jn = class e extends Kn {
	constructor(e, t) {
		super(e, t);
	}
	static create(t, n) {
		return new e(t, n);
	}
	[Gn](e, t) {
		return this.sendRequest(I.session_new, e, (e) => this.attachSession(e), t);
	}
	buildSession(e) {
		return typeof e == "string" ? nr.create(this, {
			cwd: e,
			mcpServers: []
		}) : nr.create(this, e);
	}
	attachSession(e) {
		let t = new er(), n = this.connectionContext.signal, r = () => {
			t.fail(n.reason ?? /* @__PURE__ */ Error("ACP connection closed"));
		};
		n.aborted ? r() : n.addEventListener("abort", r);
		let i = br(this.connectionContext).attach(e, t), a = new se(() => {
			n.removeEventListener("abort", r);
		});
		return rr.create(this, e, t, [i, a]);
	}
	request(e, t, n) {
		let r = pr[e];
		return this.sendRequest(e, t, r?.mapResponse, n);
	}
	notify(e, t) {
		return this.sendNotification(e, t);
	}
}, Yn = class {
	connection;
	constructor(e) {
		this.connection = e;
	}
	get signal() {
		return this.connection.signal;
	}
	get closed() {
		return this.connection.closed;
	}
	close(e) {
		this.connection.close(e);
	}
}, Xn = class extends Yn {
	connectHandlers;
	client;
	didStartConnectHandlers = !1;
	constructor(e, t = []) {
		super(e), this.connectHandlers = t, this.client = qn.create(e.getContext());
	}
	startConnectHandlers() {
		this.didStartConnectHandlers || (this.didStartConnectHandlers = !0, xr(this, this.connectHandlers));
	}
}, Zn = class extends Yn {
	connectHandlers;
	agent;
	didStartConnectHandlers = !1;
	constructor(e, t = []) {
		super(e), this.connectHandlers = t, this.agent = Jn.create(e.getContext());
	}
	startConnectHandlers() {
		this.didStartConnectHandlers || (this.didStartConnectHandlers = !0, xr(this, this.connectHandlers));
	}
};
function Qn(e, t = []) {
	return new Xn(e, t);
}
function $n(e, t = []) {
	return new Zn(e, t);
}
var er = class {
	values = [];
	waiters = [];
	failed = !1;
	failure;
	enqueue(e) {
		if (this.failed) return;
		let t = this.waiters.shift();
		t ? t.resolve(e) : this.values.push({
			kind: "value",
			value: e
		});
	}
	reject(e) {
		if (!this.failed) {
			if (this.waiters.length > 0) {
				for (let t of this.waiters.splice(0)) t.reject(e);
				return;
			}
			this.values.push({
				kind: "error",
				error: e
			});
		}
	}
	clearErrors() {
		this.values = this.values.filter((e) => e.kind === "value");
	}
	fail(e) {
		if (!this.failed) {
			this.failed = !0, this.failure = e;
			for (let t of this.waiters.splice(0)) t.reject(e);
		}
	}
	next() {
		if (this.values.length > 0) {
			let e = this.values.shift();
			return e.kind === "error" ? Promise.reject(e.error) : Promise.resolve(e.value);
		}
		return this.failed ? Promise.reject(this.failure) : new Promise((e, t) => {
			this.waiters.push({
				resolve: e,
				reject: t
			});
		});
	}
};
function tr(e) {
	return {
		...e,
		additionalDirectories: e.additionalDirectories ? [...e.additionalDirectories] : void 0,
		mcpServers: [...e.mcpServers]
	};
}
var nr = class e {
	cx;
	request;
	constructor(e, t) {
		this.cx = e, this.request = tr(t);
	}
	static create(t, n) {
		return new e(t, n);
	}
	toRequest() {
		return tr(this.request);
	}
	withAdditionalDirectories(e) {
		return this.request = {
			...this.request,
			additionalDirectories: [...e]
		}, this;
	}
	withMcpServer(e) {
		return this.request = {
			...this.request,
			mcpServers: [...this.request.mcpServers, e]
		}, this;
	}
	async start(e) {
		return this.cx[Gn](this.toRequest(), e);
	}
	async withSession(e) {
		let t = await this.start();
		try {
			return await e(t);
		} finally {
			t.dispose();
		}
	}
}, rr = class e {
	cx;
	sessionResponse;
	updates;
	registrations;
	constructor(e, t, n, r) {
		this.cx = e, this.sessionResponse = t, this.updates = n, this.registrations = r;
	}
	static create(t, n, r, i) {
		return new e(t, n, r, i);
	}
	get sessionId() {
		return this.sessionResponse.sessionId;
	}
	get modes() {
		return this.sessionResponse.modes;
	}
	get meta() {
		return this.sessionResponse._meta;
	}
	get newSessionResponse() {
		return this.sessionResponse;
	}
	prompt(e, t) {
		this.updates.clearErrors();
		let n = this.cx.request(I.session_prompt, {
			sessionId: this.sessionId,
			prompt: this.promptBlocks(e)
		}, t);
		return n.then((e) => {
			this.updates.enqueue({
				kind: "stop",
				response: e,
				stopReason: e.stopReason
			});
		}, (e) => {
			this.updates.reject(e);
		}), n;
	}
	nextUpdate() {
		return this.updates.next();
	}
	async readText() {
		let e = "";
		for (;;) {
			let t = await this.nextUpdate();
			if (t.kind === "stop") return e;
			let { update: n } = t;
			n.sessionUpdate === "agent_message_chunk" && n.content.type === "text" && (e += n.content.text);
		}
	}
	dispose() {
		for (let e of this.registrations.splice(0)) e.dispose();
		this.updates.fail(/* @__PURE__ */ Error("Active session disposed"));
	}
	[Symbol.dispose]() {
		this.dispose();
	}
	promptBlocks(e) {
		return typeof e == "string" ? [{
			type: "text",
			text: e
		}] : Array.isArray(e) ? e : [e];
	}
};
function ir(e, t) {
	return e ? typeof e == "function" ? e(t) : e.parse(t) : t;
}
function B(e, t, n) {
	return {
		method: e,
		params: t,
		mapResponse: n
	};
}
function ar(e, t) {
	return {
		method: e,
		params: t
	};
}
function or(e, t, n, r) {
	e.onReceiveRequest(t.method, (e) => ir(t.params, e), async (e, i, a) => {
		let o = await r(n(e, a, i.signal, i.id));
		await i.respond(t.mapResponse ? t.mapResponse(o) : o);
	});
}
function sr(e, t, n, r) {
	e.onReceiveNotification(t.method, (e) => ir(t.params, e), (e, t) => r(n(e, t, t.signal)));
}
function cr(e) {
	let t = {};
	for (let n of Object.values(e)) t[n.method] = n;
	return t;
}
var lr = {
	initialize: B(I.initialize, re),
	newSession: B(I.session_new, S),
	loadSession: B(I.session_load, ae, R),
	unstable_forkSession: B(I.session_fork, w),
	listSessions: B(I.session_list, m),
	deleteSession: B(I.session_delete, E, R),
	resumeSession: B(I.session_resume, le),
	closeSession: B(I.session_close, a, R),
	setSessionMode: B(I.session_set_mode, Te, R),
	setSessionConfigOption: B(I.session_set_config_option, fe),
	authenticate: B(I.authenticate, i, R),
	unstable_listProviders: B(I.providers_list, Pe),
	unstable_setProvider: B(I.providers_set, Re, R),
	unstable_disableProvider: B(I.providers_disable, g, R),
	logout: B(I.logout, ie, R),
	prompt: B(I.session_prompt, me),
	unstable_startNes: B(I.nes_start, He),
	unstable_suggestNes: B(I.nes_suggest, Ne),
	unstable_closeNes: B(I.nes_close, o, R)
}, ur = {
	cancel: ar(I.session_cancel, te),
	unstable_didOpenDocument: ar(I.document_did_open, c),
	unstable_didChangeDocument: ar(I.document_did_change, _),
	unstable_didCloseDocument: ar(I.document_did_close, v),
	unstable_didSaveDocument: ar(I.document_did_save, f),
	unstable_didFocusDocument: ar(I.document_did_focus, x),
	unstable_acceptNes: ar(I.nes_accept, C),
	unstable_rejectNes: ar(I.nes_reject, ke)
}, dr = {
	requestPermission: B(L.session_request_permission, Se),
	writeTextFile: B(L.fs_write_text_file, ve, R),
	readTextFile: B(L.fs_read_text_file, Be),
	createTerminal: B(L.terminal_create, t),
	terminalOutput: B(L.terminal_output, De),
	releaseTerminal: B(L.terminal_release, Ie, R),
	waitForTerminalExit: B(L.terminal_wait_for_exit, be),
	killTerminal: B(L.terminal_kill, h, R),
	createElicitation: B(L.elicitation_create, D)
}, fr = {
	sessionUpdate: ar(L.session_update, je),
	completeElicitation: ar(L.elicitation_complete, y)
}, pr = cr(lr);
cr(ur);
var mr = cr(dr), hr = cr(fr);
function gr(e, t, n, r) {
	return {
		params: e,
		requestId: r,
		signal: n,
		agent: t
	};
}
function _r(e, t, n) {
	return {
		params: e,
		signal: n,
		agent: t
	};
}
var vr = class {
	activeSessions = /* @__PURE__ */ new Map();
	handleMessage(e) {
		if (e.kind !== "notification" || e.method !== L.session_update) return _e.no(e);
		let t = je.parse(e.params), n = {
			kind: "session_update",
			notification: t,
			update: t.update
		}, r = this.activeSessions.get(t.sessionId);
		if (r && r.size > 0) for (let e of r) e.enqueue(n);
		return _e.no(e);
	}
	attach(e, t) {
		let n = this.activeSessions.get(e.sessionId) ?? /* @__PURE__ */ new Set();
		return n.add(t), this.activeSessions.set(e.sessionId, n), new se(() => {
			n.delete(t), n.size === 0 && this.activeSessions.delete(e.sessionId);
		});
	}
}, yr = /* @__PURE__ */ new WeakMap();
function br(e) {
	let t = yr.get(e);
	return t || (t = new vr(), yr.set(e, t)), t;
}
function xr(e, t) {
	for (let n of t) {
		let t;
		try {
			t = n(e);
		} catch (t) {
			throw e.close(t), t;
		}
		Promise.resolve(t).catch((t) => {
			e.close(t);
		});
	}
}
var Sr = Symbol("appBuilder"), Cr = Symbol("runAgentConnectHandlers"), wr = Symbol("runClientConnectHandlers"), Tr = { allowBatches: !1 };
function Er(e) {
	return new Dr(e);
}
var Dr = class {
	builder = ye.builder();
	connectHandlers = [];
	constructor(e = {}) {
		e.name && this.builder.name(e.name), this.builder.withHandler({
			handleMessage: (e, t) => br(t).handleMessage(e),
			describe: () => "client-session-update-router"
		});
	}
	[Sr]() {
		return this.builder;
	}
	[wr](e) {
		xr(e, this.connectHandlers);
	}
	connect(e) {
		return this.connectConnection(e).connection;
	}
	connectWith(e, t) {
		let { rawConnection: n, connection: r } = this.connectConnection(e);
		return n.runUntil(() => t(r.agent));
	}
	onConnect(e) {
		return this.connectHandlers.push(e), this;
	}
	onRequest(e, t, n) {
		if (n) return this.request({
			method: e,
			params: t
		}, n);
		let r = mr[e];
		if (!r) throw Error(`Unknown ACP request method '${e}'. Pass a params parser for custom methods.`);
		return this.request(r, t);
	}
	onNotification(e, t, n) {
		if (n) return this.notification({
			method: e,
			params: t
		}, n);
		let r = hr[e];
		if (!r) throw Error(`Unknown ACP notification method '${e}'. Pass a params parser for custom methods.`);
		return this.notification(r, t);
	}
	request(e, t) {
		return or(this.builder, e, (e, t, n, r) => gr(e, Jn.create(t, r), n, r), t), this;
	}
	notification(e, t) {
		return sr(this.builder, e, (e, t, n) => _r(e, Jn.create(t), n), t), this;
	}
	connectConnection(e) {
		if (Un(e)) {
			let t = this.openStreamConnection(e);
			return this[wr](t.connection), t;
		}
		let [t, n] = Wn(), r = e[Sr]().connect(n, Tr), i = Qn(r), a = this.openStreamConnection(t);
		a.rawConnection.closed.then(() => i.close()), r.closed.then(() => a.connection.close());
		try {
			e[Cr](i), this[wr](a.connection);
		} catch (e) {
			throw i.close(e), a.connection.close(e), e;
		}
		return a;
	}
	openStreamConnection(e) {
		let t = this.builder.connect(e, Tr);
		return {
			rawConnection: t,
			connection: $n(t, this.connectHandlers)
		};
	}
};
I.initialize, I.authenticate, I.providers_list, I.providers_set, I.providers_disable, I.session_new, I.session_load, I.session_set_mode, I.session_set_config_option, I.session_prompt, I.session_list, I.session_delete, I.session_fork, I.session_resume, I.session_close, I.logout, I.nes_start, I.nes_suggest, I.nes_close, I.session_cancel, I.nes_accept, I.nes_reject, I.document_did_open, I.document_did_change, I.document_did_close, I.document_did_save, I.document_did_focus, L.session_request_permission, L.fs_write_text_file, L.fs_read_text_file, L.terminal_create, L.terminal_output, L.terminal_release, L.terminal_wait_for_exit, L.terminal_kill, L.elicitation_create, L.session_update, L.elicitation_complete;
//#endregion
//#region src/core/protocol/v1.ts
async function Or(e) {
	let { sink: t, host: n } = e, r = Er({ name: e.clientInfo.name });
	r = r.onRequest(z.client.session.requestPermission, async ({ params: e }) => {
		let n = e, r = await t.onPermission(e.sessionId, Nr(n), n);
		return Le(r);
	}).onRequest(z.client.elicitation.create, async ({ params: e }) => {
		let n = e, r = await t.onElicitation("sessionId" in e && typeof e.sessionId == "string" ? e.sessionId : void 0, ce(n), n);
		return xe(r);
	}).onNotification(z.client.session.update, ({ params: e }) => {
		t.onProtocol(z.client.session.update, e), t.onUpdate(e.sessionId, e.update);
	}).onNotification(z.client.elicitation.complete, ({ params: e }) => {
		t.onProtocol(z.client.elicitation.complete, e), t.onElicitationComplete(e.elicitationId);
	});
	let i = n?.v1?.filesystem;
	i?.readTextFile && (r = r.onRequest(z.client.fs.readTextFile, async ({ params: e }) => await i.readTextFile(e))), i?.writeTextFile && (r = r.onRequest(z.client.fs.writeTextFile, async ({ params: e }) => await i.writeTextFile(e)));
	let a = n?.v1?.terminal;
	a && (r = r.onRequest(z.client.terminal.create, async ({ params: e }) => await a.create(e)).onRequest(z.client.terminal.output, async ({ params: e }) => await a.output(e)).onRequest(z.client.terminal.release, async ({ params: e }) => await a.release(e)).onRequest(z.client.terminal.waitForExit, async ({ params: e }) => await a.waitForExit(e)).onRequest(z.client.terminal.kill, async ({ params: e }) => await a.kill(e)));
	let o = r.connect(e.stream), s = !1;
	o.closed.then(() => {
		s || t.onDisconnect();
	});
	let c;
	try {
		c = await o.agent.request(z.agent.initialize, {
			protocolVersion: 1,
			clientInfo: {
				name: e.clientInfo.name,
				version: e.clientInfo.version,
				...e.clientInfo.title ? { title: e.clientInfo.title } : {}
			},
			clientCapabilities: {
				fs: {
					readTextFile: !!i?.readTextFile,
					writeTextFile: !!i?.writeTextFile
				},
				terminal: !!a,
				session: { configOptions: { boolean: {} } },
				auth: { terminal: !!n?.terminalAuth },
				elicitation: {
					form: {},
					url: {}
				}
			}
		});
	} catch (e) {
		throw o.close(e), new l("INITIALIZE_REJECTED", "ACP v1 initialization failed", {
			cause: e,
			protocol: 1,
			phase: "initialize",
			retryable: !0
		});
	}
	if (c.protocolVersion !== 1) throw o.close(), new l("PROTOCOL_VERSION_MISMATCH", `Requested ACP v1 but agent selected v${c.protocolVersion}`, {
		protocol: 1,
		phase: "initialize"
	});
	let u = c.agentCapabilities, d = u?.sessionCapabilities;
	return new kr(o, {
		protocolVersion: 1,
		...c.agentInfo?.title || c.agentInfo?.name ? { agentName: c.agentInfo.title ?? c.agentInfo.name } : {},
		authMethods: pe(c.authMethods),
		capabilities: {
			listSessions: d?.list != null,
			loadSession: u?.loadSession === !0,
			resumeSession: d?.resume != null,
			closeSession: d?.close != null,
			deleteSession: d?.delete != null
		},
		promptCapabilities: {
			image: u?.promptCapabilities?.image === !0,
			audio: u?.promptCapabilities?.audio === !0,
			embeddedContext: u?.promptCapabilities?.embeddedContext === !0
		},
		additionalDirectories: d?.additionalDirectories != null,
		mcp: {
			stdio: !0,
			http: u?.mcpCapabilities?.http === !0,
			sse: u?.mcpCapabilities?.sse === !0
		}
	}, t, n, () => {
		s = !0;
	});
}
var kr = class {
	connection;
	initialized;
	sink;
	host;
	markClosed;
	version = 1;
	#e = !1;
	constructor(e, t, n, r, i) {
		this.connection = e, this.initialized = t, this.sink = n, this.host = r, this.markClosed = i;
	}
	async newSession(e) {
		Fe(e, this.initialized, 1, "session/new");
		let t = await ze(() => this.connection.agent.request(z.agent.session.new, Ar(e)), 1, "session/new");
		return this.#e = !t.configOptions?.length && !!t.modes, Mr(t.sessionId, t.configOptions, t.modes);
	}
	async openSession(e, t, n) {
		Fe(t, this.initialized, 1, "session/open");
		let r = {
			...Ar(t),
			sessionId: e
		};
		if (n === "all" && this.initialized.capabilities.loadSession) {
			let t = await ze(() => this.connection.agent.request(z.agent.session.load, r), 1, "session/open");
			return Mr(e, t.configOptions, t.modes);
		}
		if (!this.initialized.capabilities.resumeSession) throw new l("CAPABILITY_REQUIRED", "The agent cannot open existing sessions", {
			protocol: 1,
			phase: "session/resume"
		});
		let i = await ze(() => this.connection.agent.request(z.agent.session.resume, r), 1, "session/open");
		return Mr(e, i.configOptions, i.modes, n === "all");
	}
	async listSessions(e, t) {
		if (!this.initialized.capabilities.listSessions) throw new l("CAPABILITY_REQUIRED", "The agent does not support session/list", { protocol: 1 });
		let n = await this.connection.agent.request(z.agent.session.list, {
			cwd: e,
			...t ? { cursor: t } : {}
		});
		return Ee(n);
	}
	async deleteSession(e) {
		if (!this.initialized.capabilities.deleteSession) throw new l("CAPABILITY_REQUIRED", "The agent does not support session/delete", { protocol: 1 });
		await this.connection.agent.request(z.agent.session.delete, { sessionId: e });
	}
	async closeSession(e) {
		this.initialized.capabilities.closeSession && await this.connection.agent.request(z.agent.session.close, { sessionId: e });
	}
	async prompt(e, t, n) {
		let r = this.connection.agent.request(z.agent.session.prompt, {
			sessionId: e,
			prompt: t
		});
		return n(), (await r).stopReason;
	}
	async cancel(e) {
		await this.connection.agent.notify(z.agent.session.cancel, { sessionId: e });
	}
	async setConfigOption(e, t, n) {
		if (this.#e && t === "mode" && typeof n == "string") return await this.connection.agent.request(z.agent.session.setMode, {
			sessionId: e,
			modeId: n
		}), [];
		let r = await this.connection.agent.request(z.agent.session.setConfigOption, {
			sessionId: e,
			configId: t,
			value: n,
			...typeof n == "boolean" ? { type: "boolean" } : {}
		});
		return he(r.configOptions);
	}
	async authenticate(e) {
		if (e.type === "terminal") {
			if (!this.host?.terminalAuth) throw new l("CAPABILITY_REQUIRED", "Terminal authentication needs a host handler", { protocol: 1 });
			await this.host.terminalAuth(e);
			return;
		}
		await this.connection.agent.request(z.agent.authenticate, { methodId: e.id });
	}
	async logout() {
		await this.connection.agent.request(z.agent.logout, {});
	}
	async close(e) {
		this.markClosed(), this.connection.close(e), await this.connection.closed;
	}
};
function Ar(e) {
	return {
		cwd: e.cwd,
		mcpServers: (e.mcpServers ?? []).map(jr),
		...e.additionalDirectories?.length ? { additionalDirectories: [...e.additionalDirectories] } : {}
	};
}
function jr(e) {
	return e.type === "stdio" ? {
		name: e.name,
		command: e.command,
		args: [...e.args ?? []],
		env: [...e.env ?? []]
	} : {
		type: e.type,
		name: e.name,
		url: e.url,
		headers: [...e.headers ?? []]
	};
}
function Mr(e, t, n, r = !1) {
	let i = he(t);
	return {
		sessionId: e,
		configOptions: i.length ? i : Me(n),
		...r ? { historyGap: r } : {}
	};
}
function Nr(e) {
	let t = Ve(e) ? e : {}, n = Ve(t.toolCall) ? t.toolCall : {};
	return {
		type: "permission",
		title: we(n.title) ?? "Permission required",
		options: Ae(t.options)
	};
}
//#endregion
//#region src/core/protocol/connect.ts
async function Pr(e) {
	if (e.protocol === 1) return Fr(1, 1, e);
	if (e.protocol === 2) return Fr(2, 1, e);
	let t = await e.connector.open({
		protocol: 2,
		attempt: 1,
		signal: e.signal
	}), n = Lr(t);
	try {
		return await Ir(n.stream, e);
	} catch (r) {
		if (n.negotiatedVersion() !== 1) throw r;
		return await Br(t), Fr(1, 2, e);
	}
}
async function Fr(e, t, n) {
	let r = await n.connector.open({
		protocol: e,
		attempt: t,
		signal: n.signal
	});
	if (n.signal.aborted) throw await Br(r), new l("CONNECTION_CLOSED", "Connection was cancelled", {
		protocol: e,
		retryable: !0
	});
	return e === 1 ? Or({
		stream: r,
		sink: n.sink,
		clientInfo: n.clientInfo,
		...n.host ? { host: n.host } : {}
	}) : Ir(r, n);
}
async function Ir(e, t) {
	let { connectV2: n } = await import("./chunks/v2.js");
	return n({
		stream: e,
		sink: t.sink,
		clientInfo: t.clientInfo,
		...t.host ? { host: t.host } : {}
	});
}
function Lr(e) {
	let t, n, r = e.writable, i = e.readable, a = new WritableStream({
		async write(e) {
			let n = Rr(e);
			n && (t = n.id);
			let i = r.getWriter();
			try {
				await i.write(e);
			} finally {
				i.releaseLock();
			}
		},
		async close() {
			let e = r.getWriter();
			try {
				await e.close();
			} finally {
				e.releaseLock();
			}
		},
		async abort(e) {
			let t = r.getWriter();
			try {
				await t.abort(e);
			} finally {
				t.releaseLock();
			}
		}
	});
	return {
		stream: {
			readable: i.pipeThrough(new TransformStream({ transform(e, r) {
				let i = Array.isArray(e) ? e : [e];
				for (let e of i) !zr(e) || e.id !== t || !zr(e.result) || typeof e.result.protocolVersion == "number" && (n = e.result.protocolVersion);
				r.enqueue(e);
			} })),
			writable: a
		},
		negotiatedVersion: () => n
	};
}
function Rr(e) {
	let t = Array.isArray(e) ? e : [e];
	for (let e of t) if (zr(e) && e.method === "initialize" && Object.hasOwn(e, "id")) return { id: e.id };
}
function zr(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
async function Br(e) {
	try {
		let t = e.writable.getWriter();
		try {
			await t.close();
		} finally {
			t.releaseLock();
		}
	} catch {}
}
//#endregion
//#region src/core/chat-controller.ts
var Vr = {
	listSessions: !1,
	loadSession: !1,
	resumeSession: !1,
	closeSession: !1,
	deleteSession: !1
};
function Hr(e) {
	return new Ur(e);
}
var Ur = class {
	ready;
	#e;
	#t = /* @__PURE__ */ new Set();
	#n = new de();
	#r;
	#i = /* @__PURE__ */ new Map();
	#a = /* @__PURE__ */ new Map();
	#o;
	#s;
	#c;
	#l;
	#u = 0;
	#d = !1;
	#f;
	#p = 0;
	#m;
	#h;
	constructor(e) {
		this.#e = e, this.#s = {
			phase: "connecting",
			historyGap: !1,
			activities: [],
			contextItems: [],
			configOptions: [],
			commands: [],
			interactions: [],
			authMethods: [],
			capabilities: Vr,
			sessionTrail: []
		}, this.ready = this.#g(!0), this.ready.catch(() => void 0);
	}
	getSnapshot() {
		return this.#s;
	}
	subscribe(e) {
		return this.#t.add(e), () => this.#t.delete(e);
	}
	send(e) {
		if (this.#k(), this.#c || this.#s.phase === "running" || this.#s.phase === "cancelling") throw new l("SESSION_BUSY", "Wait for the current turn to finish", {
			protocol: this.#o?.version,
			phase: "prompt"
		});
		let t = Gr(e);
		if (!t.length || t.every((e) => e.type === "text" && typeof e.text == "string" && !e.text.trim())) throw new l("INVALID_CONFIGURATION", "A prompt cannot be empty", { phase: "prompt" });
		Oe(t, this.#j().initialized.promptCapabilities, this.#j().version);
		let n = `turn-${++this.#u}`, r = {
			id: n,
			abort: new AbortController(),
			cancelled: !1,
			submitted: !1
		};
		this.#c = r, this.#n.beginTurn(), this.#n.addUserMessage(t, !0), this.#N({
			phase: "running",
			activities: this.#n.activities,
			stopReason: void 0,
			error: void 0
		}), this.#F({
			type: "turn_started",
			turnId: n
		});
		let i = this.#v(r, t);
		return i.catch(() => void 0), {
			id: n,
			done: i
		};
	}
	async cancel() {
		let e = this.#c;
		if (!e || e.cancelled || (e.cancelled = !0, e.abort.abort(Jr), this.#D(), this.#N({ phase: "cancelling" }), !e.submitted)) return;
		let t = this.#s.sessionId, n = this.#o;
		if (t && n) try {
			await n.cancel(t);
		} catch (t) {
			throw this.#c === e && (e.cancelled = !1, this.#M(t)), t;
		}
	}
	async reconnect() {
		await this.#R("connection/reconnect", () => this.#g(!1));
	}
	async newSession() {
		await this.#L("session/new", async (e) => {
			let t = await e.newSession(this.#e.session);
			this.#z(e), this.#D(), this.#n.reset(), this.#b(t, this.#n);
		});
	}
	async listSessions(e) {
		if (this.#h) throw new l("SESSION_BUSY", "Wait for the current session-list request to finish", {
			protocol: this.#o?.version,
			phase: "session/list"
		});
		let t = this.#j(), n = Symbol("session/list");
		this.#h = n;
		try {
			let n = await t.listSessions(this.#e.session.cwd, e);
			this.#z(t);
			let r = e && this.#s.sessions ? {
				sessions: qr([...this.#s.sessions.sessions, ...n.sessions]).slice(0, 1e3),
				...n.nextCursor ? { nextCursor: n.nextCursor } : {}
			} : n;
			return this.#N({ sessions: r }), r;
		} finally {
			this.#h === n && (this.#h = void 0);
		}
	}
	async openSession(e) {
		await this.#L("session/open", async (t) => {
			if (e === this.#s.sessionId) {
				this.#N({ sessionTrail: [] });
				return;
			}
			await this.#x(t, e, []);
		});
	}
	async openChildSession(e) {
		await this.#L("session/open-child", async (t) => {
			let n = this.#s.sessionId;
			if (!n) throw new l("SESSION_NOT_READY", "No active session", { phase: "session/open-child" });
			if (e === n) return;
			let r = {
				sessionId: n,
				...this.#s.sessionTitle ? { title: this.#s.sessionTitle } : {}
			};
			await this.#x(t, e, [...this.#s.sessionTrail, r]);
		});
	}
	async openAncestorSession(e) {
		await this.#L("session/open-ancestor", async (t) => {
			let n = this.#s.sessionTrail.findIndex((t) => t.sessionId === e);
			if (n < 0) throw new l("INVALID_CONFIGURATION", `Session '${e}' is not an ancestor of the active session`, { phase: "session/open-ancestor" });
			await this.#x(t, e, this.#s.sessionTrail.slice(0, n));
		});
	}
	async closeSession() {
		await this.#L("session/close", async (e) => {
			let t = this.#s.sessionId;
			t && (await e.closeSession(t), this.#z(e), this.#D(), this.#n.reset(), this.#N({
				sessionId: void 0,
				sessionTitle: void 0,
				sessionTrail: [],
				historyGap: !1,
				activities: [],
				configOptions: [],
				commands: [],
				phase: "idle"
			}));
		});
	}
	async deleteSession(e) {
		if (e === this.#s.sessionId) throw new l("INVALID_CONFIGURATION", "The active session cannot be deleted", { phase: "session/delete" });
		await this.#L("session/delete", async (t) => {
			await t.deleteSession(e), this.#z(t), this.#s.sessions && this.#N({ sessions: {
				...this.#s.sessions,
				sessions: this.#s.sessions.sessions.filter((t) => t.sessionId !== e)
			} });
		});
	}
	async setConfigOption(e, t) {
		await this.#L("session/set-config", async (n) => {
			let r = this.#s.sessionId;
			if (!r) throw new l("SESSION_NOT_READY", "No active session");
			let i = await n.setConfigOption(r, e, t);
			this.#z(n);
			let a = i.length ? i : this.#s.configOptions.map((n) => n.id === e ? {
				...n,
				currentValue: t
			} : n);
			this.#N({ configOptions: a });
		});
	}
	async authenticate(e) {
		let t = this.#s.authMethods.find((t) => t.id === e);
		if (!t) throw new l("INVALID_CONFIGURATION", `Unknown authentication method '${e}'`);
		await this.#L("auth/login", async (e) => {
			this.#N({
				phase: "connecting",
				error: void 0
			});
			try {
				await e.authenticate(t), this.#z(e);
				let n = await e.newSession(this.#e.session);
				this.#z(e), this.#n.reset(), this.#b(n, this.#n);
			} catch (e) {
				throw this.#M(e), e;
			}
		});
	}
	async logout() {
		await this.#L("auth/logout", async (e) => {
			await e.logout(), this.#z(e), this.#D(), this.#n.reset(), this.#N({
				phase: "auth_required",
				sessionId: void 0,
				sessionTrail: [],
				activities: [],
				configOptions: [],
				commands: []
			});
		});
	}
	respondPermission(e, t) {
		let n = this.#i.get(e);
		return n ? (this.#i.delete(e), n.resolve(t), this.#E(e), !0) : !1;
	}
	respondElicitation(e, t) {
		let n = this.#a.get(e);
		return n ? (this.#a.delete(e), n.resolve(t), this.#E(e), !0) : !1;
	}
	async destroy() {
		if (this.#d) return;
		this.#d = !0, this.#p += 1, this.#r?.abort(), this.#c?.abort.abort(new l("TURN_INTERRUPTED", "Chat was destroyed before the turn completed", {
			phase: "destroy",
			retryable: !1
		})), this.#D();
		let e = this.#o;
		this.#o = void 0, this.#l = void 0, this.#N({ phase: "closed" }), await e?.close().catch(() => void 0), this.#t.clear();
	}
	onUpdate(e, t) {
		if (this.#d) return;
		let n = this.#l?.sessionId === e ? this.#l : void 0;
		if (!n && e !== this.#s.sessionId) return;
		let r = n?.timeline ?? this.#n, i = r.reduce(t, this.#o?.version ?? 1);
		if (n) {
			this.#w(n, i);
			return;
		}
		this.#S(i), this.#N({ activities: r.activities });
	}
	onPermission(e, t, n) {
		if (this.#d || !this.#c || e !== this.#s.sessionId || !this.#C()) return Promise.resolve({ outcome: "cancelled" });
		let r = `permission-${++this.#u}`, i = {
			...t,
			id: r
		};
		return new Promise((e) => {
			this.#i.set(r, {
				interaction: i,
				resolve: e
			}), this.#T(i);
		});
	}
	onElicitation(e, t, n) {
		if (this.#d || e !== void 0 && e !== this.#s.sessionId || t.elicitationId !== void 0 && this.#O(t.elicitationId) !== void 0 || !this.#C()) return Promise.resolve({ action: "cancel" });
		let r = `elicitation-${++this.#u}`, i = {
			...t,
			id: r
		};
		return new Promise((e) => {
			this.#a.set(r, {
				interaction: i,
				resolve: e
			}), this.#T(i);
		});
	}
	onElicitationComplete(e) {
		if (this.#d) return;
		let t = this.#O(e);
		if (!t) return;
		let n = this.#a.get(t);
		n && (this.#a.delete(t), n.resolve({ action: "accept" }), this.#E(t));
	}
	onProtocol(e, t) {
		let n = this.#o?.version;
		n && this.#F({
			type: "protocol",
			protocolVersion: n,
			method: e,
			raw: t
		});
	}
	onDisconnect() {
		this.#d || (this.#D(), this.#M(new l("CONNECTION_CLOSED", "The ACP connection closed", {
			protocol: this.#o?.version,
			phase: "connection",
			retryable: !0
		})));
	}
	async #g(e) {
		if (this.#f) return this.#f;
		let t = this.#_(e);
		return this.#f = t, t.then(() => {
			this.#f === t && (this.#f = void 0);
		}, () => {
			this.#f === t && (this.#f = void 0);
		}), t;
	}
	async #_(e) {
		if (this.#d) throw Zr();
		let t = ++this.#p;
		this.#r?.abort();
		let n = new AbortController();
		this.#r = n, this.#N({
			phase: "connecting",
			error: void 0
		});
		let r = this.#o, i = this.#s.sessionId;
		r && (this.#o = void 0, await r.close().catch(() => void 0), this.#V(t));
		let a;
		try {
			if (a = await Pr({
				connector: this.#e.connector,
				protocol: this.#e.protocol ?? 1,
				signal: n.signal,
				sink: this,
				clientInfo: {
					name: this.#e.clientInfo?.name ?? "pretty-aui",
					version: this.#e.clientInfo?.version ?? "0.1.0",
					...this.#e.clientInfo?.title ? { title: this.#e.clientInfo.title } : {}
				},
				...this.#e.host ? { host: this.#e.host } : {}
			}), !this.#B(t)) throw await a.close().catch(() => void 0), Zr();
			this.#o = a, this.#N({
				protocolVersion: a.version,
				agentName: a.initialized.agentName,
				authMethods: a.initialized.authMethods,
				capabilities: a.initialized.capabilities
			}), this.#F({
				type: "connected",
				protocolVersion: a.version
			});
			let r, o = !e && i && (a.initialized.capabilities.resumeSession || a.initialized.capabilities.loadSession);
			r = o ? await a.openSession(i, this.#e.session, a.initialized.capabilities.resumeSession ? "none" : "all") : await a.newSession(this.#e.session), this.#V(t, a), (e || !o) && this.#n.reset(), this.#b(r, this.#n, void 0, [], o ? this.#s.sessionTrail : []);
		} catch (e) {
			throw this.#B(t) ? e instanceof l && e.code === "AUTHENTICATION_REQUIRED" && this.#s.authMethods.length ? (this.#N({
				phase: "auth_required",
				error: void 0
			}), new l("AUTHENTICATION_REQUIRED", "Authentication is required before a session can be created", {
				cause: e,
				protocol: a?.version,
				phase: "session/new"
			})) : (this.#M(e), e) : (a && this.#o === a && (this.#o = void 0), await a?.close().catch(() => void 0), Zr());
		}
	}
	async #v(e, t) {
		try {
			let n = this.#j(), r = this.#s.sessionId;
			if (!r) throw new l("SESSION_NOT_READY", "No active session");
			let i = await this.#y(t, e.abort.signal);
			Yr(e.abort.signal);
			let a = [...i.flatMap((e) => e.content.map((t) => Kr(t, e))), ...t];
			Oe(a, n.initialized.promptCapabilities, n.version), this.#N({ contextItems: i.map(({ id: e, label: t }) => ({
				id: e,
				label: t
			})) }), Yr(e.abort.signal), e.submitted = !0;
			let o = await n.prompt(r, a, () => {
				this.#d || (this.#n.markUserAccepted(), this.#N({ activities: this.#n.activities }));
			});
			return this.#I(e, e.cancelled ? "cancelled" : o);
		} catch (t) {
			if (e.cancelled || t === Jr) return this.#I(e, "cancelled");
			throw this.#c === e && (this.#c = void 0), this.#M(t), t;
		}
	}
	async #y(e, t) {
		try {
			let n = this.#e.context;
			if (!n) return [];
			let r = typeof n == "function" ? await Xr(n({
				...this.#s.sessionId ? { sessionId: this.#s.sessionId } : {},
				input: e,
				...this.#s.protocolVersion ? { protocolVersion: this.#s.protocolVersion } : {},
				signal: t
			}), t) : n, i = /* @__PURE__ */ new Set();
			if (r.length > 64) throw Error("Context is limited to 64 items per turn");
			for (let e of r) {
				if (!e.id || i.has(e.id)) throw Error(`Context item IDs must be unique: '${e.id}'`);
				i.add(e.id);
			}
			return r;
		} catch (e) {
			throw t.aborted ? t.reason ?? e : new l("CONTEXT_FAILED", "Context could not be prepared; the prompt was not sent", {
				cause: e,
				protocol: this.#o?.version,
				phase: "context",
				retryable: !0
			});
		}
	}
	#b(e, t, n, r = [], i = []) {
		this.#d || (this.#s = Wr({
			...this.#s,
			phase: "idle",
			sessionId: e.sessionId,
			sessionTitle: n,
			sessionTrail: [...i],
			historyGap: e.historyGap ?? !1,
			activities: t.activities,
			configOptions: e.configOptions,
			commands: r,
			interactions: [],
			contextItems: [],
			stopReason: void 0,
			error: void 0
		}), this.#P(), this.#F({
			type: "session_changed",
			sessionId: e.sessionId
		}));
	}
	async #x(e, t, n) {
		let r = {
			sessionId: t,
			timeline: new de(),
			configOptions: [],
			commands: [],
			sessionTitle: void 0
		};
		this.#l = r;
		try {
			let i = await e.openSession(t, this.#e.session, "all");
			this.#z(e);
			let a = this.#s.sessionId;
			this.#D(), this.#n = r.timeline, this.#b({
				...i,
				configOptions: i.configOptions.length ? i.configOptions : r.configOptions
			}, r.timeline, r.sessionTitle, r.commands, n), a && e.initialized.capabilities.closeSession && await e.closeSession(a).catch(() => void 0);
		} finally {
			this.#l === r && (this.#l = void 0);
		}
	}
	#S(e) {
		let t = {};
		e.state && !this.#c ? this.#F({
			type: "diagnostic",
			code: "STALE_SESSION_STATE",
			message: `Ignored ${e.state} state without an active turn`
		}) : (e.state === "running" && (t.phase = "running"), e.state === "requires_action" && (t.phase = "awaiting_user"), e.state === "idle" && (t.phase = "idle", e.stopReason && (t.stopReason = e.stopReason))), e.commands && (t.commands = e.commands), e.configOptions && (t.configOptions = e.configOptions), e.sessionTitle !== void 0 && (t.sessionTitle = e.sessionTitle ?? void 0), e.usage && (t.usage = e.usage), e.unsupported && this.#F({
			type: "diagnostic",
			code: "UNSUPPORTED_UPDATE",
			message: e.unsupported
		}), Object.keys(t).length && this.#N(t);
	}
	#C() {
		return this.#i.size + this.#a.size < 16 || (this.#F({
			type: "diagnostic",
			code: "INTERACTION_LIMIT",
			message: "Cancelled an interaction beyond the 16-interaction limit"
		}), !1);
	}
	#w(e, t) {
		t.commands && (e.commands = t.commands), t.configOptions && (e.configOptions = t.configOptions), t.sessionTitle !== void 0 && (e.sessionTitle = t.sessionTitle ?? void 0);
	}
	#T(e) {
		this.#N({
			phase: "awaiting_user",
			interactions: [...this.#s.interactions, e]
		});
	}
	#E(e) {
		let t = this.#s.interactions.filter((t) => t.id !== e);
		this.#N({
			interactions: t,
			phase: t.length ? "awaiting_user" : this.#c ? "running" : "idle"
		});
	}
	#D() {
		for (let e of this.#i.values()) e.resolve({ outcome: "cancelled" });
		for (let e of this.#a.values()) e.resolve({ action: "cancel" });
		this.#i.clear(), this.#a.clear(), this.#s.interactions.length && this.#N({ interactions: [] });
	}
	#O(e) {
		for (let [t, n] of this.#a) if (n.interaction.type === "elicitation" && n.interaction.elicitationId === e) return t;
	}
	#k() {
		if (this.#d) throw new l("CONNECTION_CLOSED", "Chat has been destroyed");
		if (!this.#o || !this.#s.sessionId) throw new l("SESSION_NOT_READY", "The chat session is not ready", { phase: "prompt" });
		if (this.#s.phase === "auth_required") throw new l("SESSION_NOT_READY", "Authenticate before sending a prompt", { phase: "prompt" });
	}
	#A() {
		if (this.#d) throw Zr();
		if (this.#c || this.#i.size || this.#a.size || this.#s.interactions.length || this.#s.phase === "running" || this.#s.phase === "cancelling") throw new l("SESSION_BUSY", "Finish the current turn or interaction first", { phase: "session" });
	}
	#j() {
		if (this.#d) throw Zr();
		if (!this.#o) throw new l("SESSION_NOT_READY", "The ACP connection is not ready");
		return this.#o;
	}
	#M(e) {
		if (this.#d) return;
		let t = p(e);
		this.#N({
			phase: "error",
			error: t
		}), this.#F({
			type: "error",
			error: t
		});
	}
	#N(e) {
		this.#d && e.phase !== "closed" || (this.#s = Wr({
			...this.#s,
			...e
		}), this.#P());
	}
	#P() {
		for (let e of this.#t) try {
			e();
		} catch {}
	}
	#F(e) {
		if (!this.#d) try {
			this.#e.onEvent?.(e);
		} catch {}
	}
	#I(e, t) {
		if (this.#d) throw Zr();
		return this.#c === e && (this.#c = void 0), this.#N({
			phase: "idle",
			stopReason: t,
			activities: this.#n.activities
		}), this.#F({
			type: "turn_completed",
			turnId: e.id,
			stopReason: t
		}), { stopReason: t };
	}
	async #L(e, t) {
		return this.#R(e, () => t(this.#j()));
	}
	async #R(e, t) {
		if (this.#A(), this.#m) throw new l("SESSION_BUSY", "Wait for the current session operation to finish", {
			protocol: this.#o?.version,
			phase: e
		});
		let n = Symbol(e);
		this.#m = n;
		try {
			return await t();
		} finally {
			this.#m === n && (this.#m = void 0);
		}
	}
	#z(e) {
		if (this.#d || this.#o !== e) throw Zr();
	}
	#B(e) {
		return !this.#d && this.#p === e;
	}
	#V(e, t) {
		if (!this.#B(e) || t !== void 0 && this.#o !== t) throw Zr();
	}
};
function Wr(e) {
	let t = { ...e };
	for (let [e, n] of Object.entries(t)) n === void 0 && delete t[e];
	return t;
}
function Gr(e) {
	return typeof e == "string" ? [{
		type: "text",
		text: e
	}] : Array.isArray(e) ? [...e] : [e];
}
function Kr(e, t) {
	return {
		...e,
		_meta: {
			...e._meta ?? {},
			"pretty-aui/context": {
				id: t.id,
				label: t.label
			}
		}
	};
}
function qr(e) {
	let t = /* @__PURE__ */ new Set();
	return e.filter((e) => !t.has(e.sessionId) && (t.add(e.sessionId), !0));
}
var Jr = Symbol("turn-cancelled");
function Yr(e) {
	if (e.aborted) throw e.reason ?? Jr;
}
function Xr(e, t) {
	return t.aborted ? Promise.reject(t.reason ?? Jr) : new Promise((n, r) => {
		let i = () => {
			r(t.reason ?? Jr);
		};
		t.addEventListener("abort", i, { once: !0 }), Promise.resolve(e).then((e) => {
			t.removeEventListener("abort", i), n(e);
		}, (e) => {
			t.removeEventListener("abort", i), r(e);
		});
	});
}
function Zr() {
	return new l("CONNECTION_CLOSED", "Chat ownership ended before the operation completed", {
		phase: "connection",
		retryable: !1
	});
}
//#endregion
//#region node_modules/.pnpm/dompurify@3.4.14/node_modules/dompurify/dist/purify.es.mjs
function Qr(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function $r(e) {
	if (Array.isArray(e)) return e;
}
function ei(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t !== 0) for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function ti() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ni(e, t) {
	return $r(e) || ei(e, t) || ri(e, t) || ti();
}
function ri(e, t) {
	if (e) {
		if (typeof e == "string") return Qr(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qr(e, t) : void 0;
	}
}
var ii = Object.entries, ai = Object.setPrototypeOf, oi = Object.isFrozen, si = Object.getPrototypeOf, ci = Object.getOwnPropertyDescriptor, V = Object.freeze, H = Object.seal, li = Object.create, ui = typeof Reflect < "u" && Reflect, di = ui.apply, fi = ui.construct;
V ||= function(e) {
	return e;
}, H ||= function(e) {
	return e;
}, di ||= function(e, t) {
	var n = [...arguments].slice(2);
	return e.apply(t, n);
}, fi ||= function(e) {
	return new e(...[...arguments].slice(1));
};
var pi = G(Array.prototype.forEach), mi = G(Array.prototype.lastIndexOf), hi = G(Array.prototype.pop), gi = G(Array.prototype.push), _i = G(Array.prototype.splice), vi = Array.isArray, yi = G(String.prototype.toLowerCase), bi = G(String.prototype.toString), xi = G(String.prototype.match), Si = G(String.prototype.replace), Ci = G(String.prototype.indexOf), wi = G(String.prototype.trim), Ti = G(Number.prototype.toString), Ei = G(Boolean.prototype.toString), Di = typeof BigInt > "u" ? null : G(BigInt.prototype.toString), Oi = typeof Symbol > "u" ? null : G(Symbol.prototype.toString), U = G(Object.prototype.hasOwnProperty), ki = G(Object.prototype.toString), W = G(RegExp.prototype.test), Ai = ji(TypeError);
function G(e) {
	return function(t) {
		t instanceof RegExp && (t.lastIndex = 0);
		var n = [...arguments].slice(1);
		return di(e, t, n);
	};
}
function ji(e) {
	return function() {
		return fi(e, [...arguments]);
	};
}
function K(e, t) {
	let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : yi;
	if (ai && ai(e, null), !vi(t)) return e;
	let r = t.length;
	for (; r--;) {
		let i = t[r];
		if (typeof i == "string") {
			let e = n(i);
			e !== i && (oi(t) || (t[r] = e), i = e);
		}
		e[i] = !0;
	}
	return e;
}
function Mi(e) {
	for (let t = 0; t < e.length; t++) U(e, t) || (e[t] = null);
	return e;
}
function q(e) {
	let t = li(null);
	for (let r of ii(e)) {
		var n = ni(r, 2);
		let i = n[0], a = n[1];
		U(e, i) && (t[i] = vi(a) ? Mi(a) : a && typeof a == "object" && a.constructor === Object ? q(a) : a);
	}
	return t;
}
function Ni(e) {
	switch (typeof e) {
		case "string": return e;
		case "number": return Ti(e);
		case "boolean": return Ei(e);
		case "bigint": return Di ? Di(e) : "0";
		case "symbol": return Oi ? Oi(e) : "Symbol()";
		case "undefined": return ki(e);
		case "function":
		case "object": {
			if (e === null) return ki(e);
			let t = e, n = Pi(t, "toString");
			if (typeof n == "function") {
				let e = n(t);
				return typeof e == "string" ? e : ki(e);
			}
			return ki(e);
		}
		default: return ki(e);
	}
}
function Pi(e, t) {
	for (; e !== null;) {
		let n = ci(e, t);
		if (n) {
			if (n.get) return G(n.get);
			if (typeof n.value == "function") return G(n.value);
		}
		e = si(e);
	}
	function n() {
		return null;
	}
	return n;
}
function Fi(e) {
	try {
		return W(e, ""), !0;
	} catch {
		return !1;
	}
}
var Ii = V(/* @__PURE__ */ "a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr".split(".")), Li = V(/* @__PURE__ */ "svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern".split(".")), Ri = V([
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence"
]), zi = V([
	"animate",
	"color-profile",
	"cursor",
	"discard",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignobject",
	"hatch",
	"hatchpath",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"missing-glyph",
	"script",
	"set",
	"solidcolor",
	"unknown",
	"use"
]), Bi = V(/* @__PURE__ */ "math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts".split(".")), Vi = V([
	"maction",
	"maligngroup",
	"malignmark",
	"mlongdiv",
	"mscarries",
	"mscarry",
	"msgroup",
	"mstack",
	"msline",
	"msrow",
	"semantics",
	"annotation",
	"annotation-xml",
	"mprescripts",
	"none"
]), Hi = V(["#text"]), Ui = V(/* @__PURE__ */ "accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns".split(".")), Wi = V(/* @__PURE__ */ "accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan".split(".")), Gi = V(/* @__PURE__ */ "accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns".split(".")), Ki = V([
	"xlink:href",
	"xml:id",
	"xlink:title",
	"xml:space",
	"xmlns:xlink"
]), qi = H(/{{[\w\W]*|^[\w\W]*}}/g), Ji = H(/<%[\w\W]*|^[\w\W]*%>/g), Yi = H(/\${[\w\W]*/g), Xi = H(/^data-[\-\w.\u00B7-\uFFFF]+$/), Zi = H(/^aria-[\-\w]+$/), Qi = H(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), $i = H(/^(?:\w+script|data):/i), ea = H(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), ta = H(/^html$/i), na = H(/^[a-z][.\w]*(-[.\w]+)+$/i), ra = H(/<[/\w!]/g), ia = H(/<[/\w]/g), aa = H(/<\/no(script|embed|frames)/i), oa = H(/\/>/i), J = {
	element: 1,
	attribute: 2,
	text: 3,
	cdataSection: 4,
	entityReference: 5,
	entityNode: 6,
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,
	documentFragment: 11,
	notation: 12
}, sa = [
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
], ca = V(K({}, sa)), la = function() {
	let e = {};
	return pi(sa, (t) => {
		e[t] = H(RegExp("</" + t + "(?=[\\t\\n\\f\\r />])", "i"));
	}), V(e);
}(), ua = function() {
	return typeof window > "u" ? null : window;
}, da = function(e, t) {
	if (typeof e != "object" || typeof e.createPolicy != "function") return null;
	let n = null, r = "data-tt-policy-suffix";
	t && t.hasAttribute(r) && (n = t.getAttribute(r));
	let i = "dompurify" + (n ? "#" + n : "");
	try {
		return e.createPolicy(i, {
			createHTML(e) {
				return e;
			},
			createScriptURL(e) {
				return e;
			}
		});
	} catch {
		return console.warn("TrustedTypes policy " + i + " could not be created."), null;
	}
}, fa = function() {
	return {
		afterSanitizeAttributes: [],
		afterSanitizeElements: [],
		afterSanitizeShadowDOM: [],
		beforeSanitizeAttributes: [],
		beforeSanitizeElements: [],
		beforeSanitizeShadowDOM: [],
		uponSanitizeAttribute: [],
		uponSanitizeElement: [],
		uponSanitizeShadowNode: []
	};
}, pa = function(e, t, n, r) {
	return U(e, t) && vi(e[t]) ? K(r.base ? q(r.base) : {}, e[t], r.transform) : n;
}, ma = function(e, t, n) {
	let r = U(e, t) ? e[t] : void 0;
	return r && typeof r == "object" ? q(r) : n();
};
function ha() {
	let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ua(), t = (e) => ha(e);
	if (t.version = "3.4.14", t.removed = [], !e || !e.document || e.document.nodeType !== J.document || !e.Element) return t.isSupported = !1, t;
	let n = e.document, r = n, i = r.currentScript;
	e.DocumentFragment;
	let a = e.HTMLTemplateElement, o = e.Node, s = e.Element, c = e.NodeFilter;
	e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
	let l = e.DOMParser, u = e.trustedTypes, d = s.prototype, f = Pi(d, "cloneNode"), p = Pi(d, "remove"), m = Pi(d, "nextSibling"), h = Pi(d, "childNodes"), g = Pi(d, "parentNode"), _ = Pi(d, "shadowRoot"), v = Pi(d, "attributes"), y = o && o.prototype ? Pi(o.prototype, "nodeType") : null, b = o && o.prototype ? Pi(o.prototype, "nodeName") : null, x = o && o.prototype ? Pi(o.prototype, "ownerDocument") : null, S = function(e) {
		return y ? y(e) : e.nodeType;
	}, ee = function(e) {
		return b ? b(e) : e.nodeName;
	};
	if (typeof a == "function") {
		let e = n.createElement("template");
		e.content && e.content.ownerDocument && (n = e.content.ownerDocument);
	}
	let C, te = "", w, ne = !1, re = 0, ie = function() {
		if (re > 0) throw Ai("A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the \"DOMPurify and Trusted Types\" section of the README.");
	}, ae = function(e) {
		ie(), re++;
		try {
			return C.createHTML(e);
		} finally {
			re--;
		}
	}, oe = function(e) {
		ie(), re++;
		try {
			return C.createScriptURL(e);
		} finally {
			re--;
		}
	}, se = function() {
		return ne ||= (w = da(u, i), !0), w;
	}, ce = n, le = ce.implementation, ue = ce.createNodeIterator, de = ce.createDocumentFragment, fe = ce.getElementsByTagName, pe = r.importNode, T = fa();
	t.isSupported = typeof ii == "function" && typeof g == "function" && le && le.createHTMLDocument !== void 0;
	let me = qi, he = Ji, ge = Yi, _e = Xi, ve = Zi, ye = $i, be = ea, xe = na, Se = Qi, E = null, Ce = K({}, [
		...Ii,
		...Li,
		...Ri,
		...Bi,
		...Hi
	]), D = null, we = K({}, [
		...Ui,
		...Wi,
		...Gi,
		...Ki
	]), Te = Object.seal(li(null, {
		tagNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: !1
		}
	})), Ee = null, De = null, Oe = Object.seal(li(null, {
		tagCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		}
	})), ke = !0, Ae = !0, je = !1, Me = !0, Ne = !1, Pe = !0, Fe = !1, Ie = !1, Le = null, Re = null, ze = !1, Be = !1, Ve = !1, He = !1, Ue = !0, We = !1, Ge = "user-content-", Ke = !0, qe = !1, Je = {}, O = null, Ye = K({}, /* @__PURE__ */ "annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp".split(".")), Xe = null, Ze = K({}, [
		"audio",
		"video",
		"img",
		"source",
		"image",
		"track"
	]), Qe = null, $e = K({}, [
		"alt",
		"class",
		"for",
		"id",
		"label",
		"name",
		"pattern",
		"placeholder",
		"role",
		"summary",
		"title",
		"value",
		"style",
		"xmlns"
	]), et = "http://www.w3.org/1998/Math/MathML", tt = "http://www.w3.org/2000/svg", k = "http://www.w3.org/1999/xhtml", nt = k, rt = !1, it = null, at = K({}, [
		et,
		tt,
		k
	], bi), ot = V([
		"mi",
		"mo",
		"mn",
		"ms",
		"mtext"
	]), st = K({}, ot), ct = V(["annotation-xml"]), lt = K({}, ct), ut = K({}, [
		"title",
		"style",
		"font",
		"a",
		"script"
	]), A = null, dt = ["application/xhtml+xml", "text/html"], j = null, ft = null, pt = n.createElement("form"), M = function(e) {
		return e instanceof RegExp || e instanceof Function;
	}, mt = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (ft && ft === e) return;
		(!e || typeof e != "object") && (e = {}), e = q(e), A = dt.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? "text/html" : e.PARSER_MEDIA_TYPE, j = A === "application/xhtml+xml" ? bi : yi, E = pa(e, "ALLOWED_TAGS", Ce, { transform: j }), D = pa(e, "ALLOWED_ATTR", we, { transform: j }), it = pa(e, "ALLOWED_NAMESPACES", at, { transform: bi }), Qe = pa(e, "ADD_URI_SAFE_ATTR", $e, {
			transform: j,
			base: $e
		}), Xe = pa(e, "ADD_DATA_URI_TAGS", Ze, {
			transform: j,
			base: Ze
		}), O = pa(e, "FORBID_CONTENTS", Ye, { transform: j }), Ee = pa(e, "FORBID_TAGS", q({}), { transform: j }), De = pa(e, "FORBID_ATTR", q({}), { transform: j }), Je = U(e, "USE_PROFILES") ? e.USE_PROFILES && typeof e.USE_PROFILES == "object" ? q(e.USE_PROFILES) : e.USE_PROFILES : !1, ke = e.ALLOW_ARIA_ATTR !== !1, Ae = e.ALLOW_DATA_ATTR !== !1, je = e.ALLOW_UNKNOWN_PROTOCOLS || !1, Me = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ne = e.SAFE_FOR_TEMPLATES || !1, Pe = e.SAFE_FOR_XML !== !1, Fe = e.WHOLE_DOCUMENT || !1, Be = e.RETURN_DOM || !1, Ve = e.RETURN_DOM_FRAGMENT || !1, He = e.RETURN_TRUSTED_TYPE || !1, ze = e.FORCE_BODY || !1, Ue = e.SANITIZE_DOM !== !1, We = e.SANITIZE_NAMED_PROPS || !1, Ke = e.KEEP_CONTENT !== !1, qe = e.IN_PLACE || !1, Se = Fi(e.ALLOWED_URI_REGEXP) ? e.ALLOWED_URI_REGEXP : Qi, nt = typeof e.NAMESPACE == "string" ? e.NAMESPACE : k, st = ma(e, "MATHML_TEXT_INTEGRATION_POINTS", () => K({}, ot)), lt = ma(e, "HTML_INTEGRATION_POINTS", () => K({}, ct));
		let t = ma(e, "CUSTOM_ELEMENT_HANDLING", () => li(null));
		if (Te = li(null), U(t, "tagNameCheck") && M(t.tagNameCheck) && (Te.tagNameCheck = t.tagNameCheck), U(t, "attributeNameCheck") && M(t.attributeNameCheck) && (Te.attributeNameCheck = t.attributeNameCheck), U(t, "allowCustomizedBuiltInElements") && typeof t.allowCustomizedBuiltInElements == "boolean" && (Te.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements), H(Te), Ne && (Ae = !1), Ve && (Be = !0), Je && (E = K({}, Hi), D = li(null), Je.html === !0 && (K(E, Ii), K(D, Ui)), Je.svg === !0 && (K(E, Li), K(D, Wi), K(D, Ki)), Je.svgFilters === !0 && (K(E, Ri), K(D, Wi), K(D, Ki)), Je.mathMl === !0 && (K(E, Bi), K(D, Gi), K(D, Ki))), Oe.tagCheck = null, Oe.attributeCheck = null, U(e, "ADD_TAGS") && (typeof e.ADD_TAGS == "function" ? Oe.tagCheck = e.ADD_TAGS : vi(e.ADD_TAGS) && (E === Ce && (E = q(E)), K(E, e.ADD_TAGS, j))), U(e, "ADD_ATTR") && (typeof e.ADD_ATTR == "function" ? Oe.attributeCheck = e.ADD_ATTR : vi(e.ADD_ATTR) && (D === we && (D = q(D)), K(D, e.ADD_ATTR, j))), U(e, "ADD_FORBID_CONTENTS") && vi(e.ADD_FORBID_CONTENTS) && (O === Ye && (O = q(O)), K(O, e.ADD_FORBID_CONTENTS, j)), Ke && (E["#text"] = !0), Fe && K(E, [
			"html",
			"head",
			"body"
		]), E.table && (K(E, ["tbody"]), delete Ee.tbody), e.TRUSTED_TYPES_POLICY) {
			if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function") throw Ai("TRUSTED_TYPES_POLICY configuration option must provide a \"createHTML\" hook.");
			if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw Ai("TRUSTED_TYPES_POLICY configuration option must provide a \"createScriptURL\" hook.");
			let t = C;
			C = e.TRUSTED_TYPES_POLICY;
			try {
				te = ae("");
			} catch (e) {
				throw C = t, e;
			}
		} else e.TRUSTED_TYPES_POLICY === null ? (C = void 0, te = "") : (C === void 0 && (C = se()), C && typeof te == "string" && (te = ae("")));
		V && V(e), ft = e;
	}, ht = K({}, [
		...Li,
		...Ri,
		...zi
	]), gt = K({}, [...Bi, ...Vi]), _t = function(e, t, n) {
		return t.namespaceURI === k ? e === "svg" : t.namespaceURI === et ? e === "svg" && (n === "annotation-xml" || st[n]) : !!ht[e];
	}, vt = function(e, t, n) {
		return t.namespaceURI === k ? e === "math" : t.namespaceURI === tt ? e === "math" && lt[n] : !!gt[e];
	}, yt = function(e, t, n) {
		return t.namespaceURI === tt && !lt[n] || t.namespaceURI === et && !st[n] ? !1 : !gt[e] && (ut[e] || !ht[e]);
	}, bt = function(e) {
		let t = g(e);
		(!t || !t.tagName) && (t = {
			namespaceURI: nt,
			tagName: "template"
		});
		let n = yi(e.tagName), r = yi(t.tagName);
		return it[e.namespaceURI] ? e.namespaceURI === tt ? _t(n, t, r) : e.namespaceURI === et ? vt(n, t, r) : e.namespaceURI === k ? yt(n, t, r) : !!(A === "application/xhtml+xml" && it[e.namespaceURI]) : !1;
	}, xt = function(e) {
		gi(t.removed, { element: e });
		try {
			g(e).removeChild(e);
		} catch {
			if (p(e), !g(e)) throw Ai("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
		}
	}, St = function(e, t, n) {
		try {
			e.removeAttributeNode(t);
		} catch {
			try {
				e.removeAttribute(n);
			} catch {}
		}
	}, Ct = function(e) {
		Et(e);
		let t = h(e);
		if (t) {
			let e = [];
			pi(t, (t) => {
				gi(e, t);
			}), pi(e, (e) => {
				try {
					p(e);
				} catch {}
			});
		}
		let n = v(e);
		if (n) for (let t = n.length - 1; t >= 0; --t) {
			let r = n[t], i = r && r.name;
			typeof i == "string" && St(e, r, i);
		}
	}, wt = function(e, n, r) {
		if (!r) try {
			r = n.getAttributeNode(e);
		} catch {
			r = null;
		}
		gi(t.removed, {
			attribute: r || null,
			from: n
		});
		try {
			r ? n.removeAttributeNode(r) : n.removeAttribute(e);
		} catch {
			try {
				n.removeAttribute(e);
			} catch {}
		}
		if (e === "is") {
			if (Be || Ve) try {
				xt(n);
			} catch {}
			else try {
				n.setAttribute(e, "");
			} catch {}
		}
	}, Tt = function(e) {
		let t = v(e);
		if (t) for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n], i = r && r.name;
			typeof i != "string" || D[j(i)] || St(e, r, i);
		}
	}, Et = function(e) {
		let t = [e];
		for (; t.length > 0;) {
			let e = t.pop();
			S(e) === J.element && Tt(e);
			let n = h(e);
			if (n) for (let e = n.length - 1; e >= 0; --e) t.push(n[e]);
		}
	}, Dt = function(e, t) {
		return Pe ? e === "patchsrc" || e === "for" && t !== "label" && t !== "output" : !1;
	}, Ot = function(e) {
		if (!Pe) return;
		let t = [e];
		for (; t.length > 0;) {
			let e = t.pop(), n = S(e);
			if (n === J.processingInstruction || n === J.comment && W(ia, e.data)) {
				try {
					p(e);
				} catch {}
				continue;
			}
			if (n === J.element) {
				let t = e, n = j(ee(e));
				try {
					t.hasAttribute && t.hasAttribute("patchsrc") && t.removeAttribute("patchsrc"), t.hasAttribute && t.hasAttribute("for") && Dt("for", n) && t.removeAttribute("for");
				} catch {}
			}
			let r = h(e);
			if (r) for (let e = r.length - 1; e >= 0; --e) t.push(r[e]);
		}
	}, kt = function(e) {
		let t = null, r = null;
		if (ze) e = "<remove></remove>" + e;
		else {
			let t = xi(e, /^[\r\n\t ]+/);
			r = t && t[0];
		}
		A === "application/xhtml+xml" && nt === k && (e = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body>" + e + "</body></html>");
		let i = C ? ae(e) : e;
		if (nt === k) try {
			t = new l().parseFromString(i, A);
		} catch {}
		if (!t || !t.documentElement) {
			t = le.createDocument(nt, "template", null);
			try {
				t.documentElement.innerHTML = rt ? te : i;
			} catch {}
		}
		let a = t.body || t.documentElement;
		return e && r && a.insertBefore(n.createTextNode(r), a.childNodes[0] || null), nt === k ? fe.call(t, Fe ? "html" : "body")[0] : Fe ? t.documentElement : a;
	}, At = function(e) {
		let t = x ? x(e) : e.ownerDocument;
		return ue.call(t || e, e, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
	}, jt = function(e) {
		return e = Si(e, me, " "), e = Si(e, he, " "), e = Si(e, ge, " "), e;
	}, Mt = function(e) {
		e.normalize();
		let t = x ? x(e) : e.ownerDocument, n = ue.call(t || e, e, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null), r = n.nextNode();
		for (; r;) r.data = jt(r.data), r = n.nextNode();
		let i = e.querySelectorAll?.call(e, "template");
		i && pi(i, (e) => {
			Pt(e.content) && Mt(e.content);
		});
	}, Nt = function(e) {
		let t = b ? b(e) : null;
		return typeof t != "string" || j(t) !== "form" ? !1 : typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || e.attributes !== v(e) || typeof e.removeAttribute != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function" || e.nodeType !== y(e) || e.childNodes !== h(e);
	}, Pt = function(e) {
		if (!y || typeof e != "object" || !e) return !1;
		try {
			return y(e) === J.documentFragment;
		} catch {
			return !1;
		}
	}, Ft = function(e) {
		if (!y || typeof e != "object" || !e) return !1;
		try {
			return typeof y(e) == "number";
		} catch {
			return !1;
		}
	};
	function It(e, n, r) {
		e.length !== 0 && pi(e, (e) => {
			e.call(t, n, r, ft);
		});
	}
	let Lt = function(e, t) {
		return !!(Pe && e.hasChildNodes() && !Ft(e.firstElementChild) && W(ra, e.textContent) && W(ra, e.innerHTML) || Pe && e.namespaceURI === k && ca[t] && (Ft(e.firstElementChild) || typeof e.textContent == "string" && W(la[t], e.textContent)) || e.nodeType === J.processingInstruction || Pe && e.nodeType === J.comment && W(ia, e.data));
	}, N = function(e, t) {
		return e instanceof RegExp ? W(e, t) : e instanceof Function && !!e(t, ...[...arguments].slice(2));
	}, Rt = function(e, t, n) {
		if (!Ee[t] && Ut(t) && N(Te.tagNameCheck, t)) return !1;
		if (Ke && !O[t]) {
			let t = g(e), r = h(e);
			if (r && t) {
				let i = r.length;
				for (let a = i - 1; a >= 0; --a) {
					let i = e === n ? f(r[a], !0) : r[a];
					t.insertBefore(i, m(e));
				}
			}
		}
		return xt(e), !0;
	}, zt = function(e, t, n, r) {
		return e.length === 0 ? t : t === n || t === r ? q(t) : t;
	}, Bt = function(e, t) {
		return e === t || g(e) !== null ? !1 : (qe && Et(e), !0);
	}, Vt = function(e, n) {
		if (It(T.beforeSanitizeElements, e, null), Bt(e, n)) return !0;
		if (Nt(e)) return xt(e), !0;
		let r = j(ee(e));
		if (E = zt(T.uponSanitizeElement, E, Ce, Le), It(T.uponSanitizeElement, e, {
			tagName: r,
			allowedTags: E
		}), Bt(e, n)) return !0;
		if (Lt(e, r)) return xt(e), !0;
		if (Ee[r] || !(Oe.tagCheck instanceof Function && Oe.tagCheck(r)) && !E[r]) {
			let t = Rt(e, r, n);
			return t === !1 && It(T.afterSanitizeElements, e, null), t;
		}
		if (S(e) === J.element && !bt(e) || (r === "noscript" || r === "noembed" || r === "noframes") && W(aa, e.innerHTML)) return xt(e), !0;
		if (Ne && e.nodeType === J.text) {
			let n = jt(e.textContent);
			e.textContent !== n && (gi(t.removed, { element: e.cloneNode() }), e.textContent = n);
		}
		return It(T.afterSanitizeElements, e, null), !1;
	}, P = function(e, t, r) {
		if (De[t] || Dt(t, e) || Ue && (t === "id" || t === "name") && (r in n || r in pt)) return !1;
		let i = D[t] || Oe.attributeCheck instanceof Function && Oe.attributeCheck(t, e);
		return Ae && W(_e, t) || ke && W(ve, t) ? !0 : i ? Qe[t] || W(Se, Si(r, be, "")) || (t === "src" || t === "xlink:href" || t === "href") && e !== "script" && Ci(r, "data:") === 0 && Xe[e] || je && !W(ye, Si(r, be, "")) ? !0 : !r : Ut(e) && N(Te.tagNameCheck, e) && N(Te.attributeNameCheck, t, e) || t === "is" && Te.allowCustomizedBuiltInElements && N(Te.tagNameCheck, r);
	}, Ht = K({}, [
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-format",
		"font-face-name",
		"font-face-src",
		"font-face-uri",
		"missing-glyph"
	]), Ut = function(e) {
		return !Ht[yi(e)] && W(xe, e);
	}, Wt = function(e, t, n, r) {
		if (C && typeof u == "object" && typeof u.getAttributeType == "function" && !n) switch (u.getAttributeType(e, t)) {
			case "TrustedHTML": return ae(r);
			case "TrustedScriptURL": return oe(r);
		}
		return r;
	}, Gt = function(e, n, r, i) {
		try {
			r ? e.setAttributeNS(r, n, i) : e.setAttribute(n, i), Nt(e) ? xt(e) : hi(t.removed);
		} catch {
			wt(n, e);
		}
	}, Kt = function(e) {
		It(T.beforeSanitizeAttributes, e, null);
		let t = e.attributes;
		if (!t || Nt(e)) return;
		D = zt(T.uponSanitizeAttribute, D, we, Re);
		let n = {
			attrName: "",
			attrValue: "",
			keepAttr: !0,
			allowedAttributes: D,
			forceKeepAttr: void 0
		}, r = t.length, i = j(e.nodeName);
		for (; r--;) {
			let a = t[r], o = a.name, s = a.namespaceURI, c = a.value, l = j(o), u = c, d = o === "value" ? u : wi(u);
			if (n.attrName = l, n.attrValue = d, n.keepAttr = !0, n.forceKeepAttr = void 0, It(T.uponSanitizeAttribute, e, n), d = n.attrValue, We && (l === "id" || l === "name") && Ci(d, Ge) !== 0 && (wt(o, e, a), d = Ge + d), Pe && W(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, d)) {
				wt(o, e, a);
				continue;
			}
			if (l === "attributename" && xi(d, "href")) {
				wt(o, e, a);
				continue;
			}
			if (!n.forceKeepAttr) {
				if (!n.keepAttr) {
					wt(o, e, a);
					continue;
				}
				if (!Me && W(oa, d)) {
					wt(o, e, a);
					continue;
				}
				if (Ne && (d = jt(d)), !P(i, l, d)) {
					wt(o, e, a);
					continue;
				}
				d = Wt(i, l, s, d), d !== u && Gt(e, o, s, d);
			}
		}
		It(T.afterSanitizeAttributes, e, null);
	}, qt = function(e) {
		let t = null, n = At(e);
		for (It(T.beforeSanitizeShadowDOM, e, null); t = n.nextNode();) if (It(T.uponSanitizeShadowNode, t, null), Vt(t, e), Kt(t), Pt(t.content) && qt(t.content), S(t) === J.element) {
			let e = _(t);
			Pt(e) && (Jt(e), qt(e));
		}
		It(T.afterSanitizeShadowDOM, e, null);
	}, Jt = function(e) {
		let t = [{
			node: e,
			shadow: null
		}];
		for (; t.length > 0;) {
			let e = t.pop();
			if (e.shadow) {
				qt(e.shadow);
				continue;
			}
			let n = e.node, r = S(n) === J.element, i = h(n);
			if (i) for (let e = i.length - 1; e >= 0; --e) t.push({
				node: i[e],
				shadow: null
			});
			if (r) {
				let e = b ? b(n) : null;
				if (typeof e == "string" && j(e) === "template") {
					let e = n.content;
					Pt(e) && t.push({
						node: e,
						shadow: null
					});
				}
			}
			if (r) {
				let e = _(n);
				Pt(e) && t.push({
					node: null,
					shadow: e
				}, {
					node: e,
					shadow: null
				});
			}
		}
	};
	return t.sanitize = function(e) {
		let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = null, a = null, o = null, s = null;
		if (rt = !e, rt && (e = "<!-->"), typeof e != "string" && !Ft(e) && (e = Ni(e), typeof e != "string")) throw Ai("dirty is not a string, aborting");
		if (!t.isSupported) return e;
		Ie ? (E = Le, D = Re) : mt(n), (T.uponSanitizeElement.length > 0 || T.uponSanitizeAttribute.length > 0) && (E = q(E)), T.uponSanitizeAttribute.length > 0 && (D = q(D)), t.removed = [];
		let c = qe && typeof e != "string" && Ft(e);
		if (c) {
			Ot(e);
			let t = ee(e);
			if (typeof t == "string") {
				let n = j(t);
				if (!E[n] || Ee[n]) throw Ct(e), Ai("root node is forbidden and cannot be sanitized in-place");
			}
			if (Nt(e)) throw Ct(e), Ai("root node is clobbered and cannot be sanitized in-place");
			try {
				Jt(e);
			} catch (t) {
				throw Ct(e), t;
			}
		} else if (Ft(e)) i = kt("<!---->"), a = i.ownerDocument.importNode(e, !0), a.nodeType === J.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? i = a : i.appendChild(a), Jt(a);
		else {
			if (!Be && !Ne && !Fe && e.indexOf("<") === -1) return C && He ? ae(e) : e;
			if (i = kt(e), !i) return Be ? null : He ? te : "";
		}
		i && ze && xt(i.firstChild);
		let l = c ? e : i;
		try {
			let e = At(l);
			for (; o = e.nextNode();) Vt(o, l), Kt(o), Pt(o.content) && qt(o.content);
		} catch (n) {
			throw c && (Ct(e), pi(t.removed, (e) => {
				e.element && Et(e.element);
			})), n;
		}
		if (c) return pi(t.removed, (e) => {
			e.element && Et(e.element);
		}), Ne && Mt(e), e;
		if (Be) {
			if (Ne && Mt(i), Ve) for (s = de.call(i.ownerDocument); i.firstChild;) s.appendChild(i.firstChild);
			else s = i;
			return (D.shadowroot || D.shadowrootmode) && (s = pe.call(r, s, !0)), s;
		}
		let u = Fe ? i.outerHTML : i.innerHTML;
		return Fe && E["!doctype"] && i.ownerDocument && i.ownerDocument.doctype && i.ownerDocument.doctype.name && W(ta, i.ownerDocument.doctype.name) && (u = "<!DOCTYPE " + i.ownerDocument.doctype.name + ">\n" + u), Ne && (u = jt(u)), C && He ? ae(u) : u;
	}, t.setConfig = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		mt(e), Ie = !0, Le = E, Re = D;
	}, t.clearConfig = function() {
		ft = null, Ie = !1, Le = null, Re = null, C = w, te = "";
	}, t.isValidAttribute = function(e, t, n) {
		ft || mt({});
		let r = j(e), i = j(t);
		return P(r, i, n);
	}, t.addHook = function(e, t) {
		typeof t == "function" && U(T, e) && gi(T[e], t);
	}, t.removeHook = function(e, t) {
		if (U(T, e)) {
			if (t !== void 0) {
				let n = mi(T[e], t);
				return n === -1 ? void 0 : _i(T[e], n, 1)[0];
			}
			return hi(T[e]);
		}
	}, t.removeHooks = function(e) {
		U(T, e) && (T[e] = []);
	}, t.removeAllHooks = function() {
		T = fa();
	}, t;
}
var ga = ha();
//#endregion
//#region node_modules/.pnpm/marked@18.0.10/node_modules/marked/lib/marked.esm.js
function _a() {
	return {
		async: !1,
		breaks: !1,
		extensions: null,
		gfm: !0,
		hooks: null,
		pedantic: !1,
		renderer: null,
		silent: !1,
		tokenizer: null,
		walkTokens: null
	};
}
var va = _a();
function ya(e) {
	va = e;
}
var ba = { exec: () => null };
function xa(e) {
	let t = [];
	return (n) => {
		let r = Math.max(0, Math.min(3, n - 1)), i = t[r];
		return i || (i = e(r), t[r] = i), i;
	};
}
function Y(e, t = "") {
	let n = typeof e == "string" ? e : e.source, r = {
		replace: (e, t) => {
			let i = typeof t == "string" ? t : t.source;
			return i = i.replace(X.caret, "$1"), n = n.replace(e, i), r;
		},
		getRegex: () => new RegExp(n, t)
	};
	return r;
}
var Sa = ((e = "") => {
	try {
		return !!RegExp("(?<=1)(?<!1)" + e);
	} catch {
		return !1;
	}
})(), X = {
	codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
	outputLinkReplace: /\\([\[\]])/g,
	indentCodeCompensation: /^(\s+)(?:```)/,
	beginningSpace: /^\s+/,
	endingHash: /#$/,
	startingSpaceChar: /^ /,
	endingSpaceChar: / $/,
	nonSpaceChar: /[^ ]/,
	newLineCharGlobal: /\n/g,
	tabCharGlobal: /\t/g,
	multipleSpaceGlobal: /\s+/g,
	blankLine: /^[ \t]*$/,
	doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
	blockquoteStart: /^ {0,3}>/,
	blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
	blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
	listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
	listIsTask: /^\[[ xX]\] +\S/,
	listReplaceTask: /^\[[ xX]\] +/,
	listTaskCheckbox: /\[[ xX]\]/,
	anyLine: /\n.*\n/,
	hrefBrackets: /^<(.*)>$/,
	tableDelimiter: /[:|]/,
	tableAlignChars: /^\||\| *$/g,
	tableRowBlankLine: /\n[ \t]*$/,
	tableAlignRight: /^ *-+: *$/,
	tableAlignCenter: /^ *:-+: *$/,
	tableAlignLeft: /^ *:-+ *$/,
	startATag: /^<a /i,
	endATag: /^<\/a>/i,
	startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
	endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
	startAngleBracket: /^</,
	endAngleBracket: />$/,
	pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
	unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
	escapeTest: /[&<>"']/,
	escapeReplace: /[&<>"']/g,
	escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
	escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
	caret: /(^|[^\[])\^/g,
	percentDecode: /%25/g,
	findPipe: /\|/g,
	splitPipe: / \|/,
	slashPipe: /\\\|/g,
	carriageReturn: /\r\n|\r/g,
	spaceLine: /^ +$/gm,
	notSpaceStart: /^\S*/,
	endingNewline: /\n$/,
	listItemRegex: (e) => RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
	nextBulletRegex: xa((e) => RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
	hrRegex: xa((e) => RegExp(`^ {0,${e}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),
	fencesBeginRegex: xa((e) => RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),
	headingBeginRegex: xa((e) => RegExp(`^ {0,${e}}#`)),
	htmlBeginRegex: xa((e) => RegExp(`^ {0,${e}}<(?:[a-z].*>|!--)`, "i")),
	blockquoteBeginRegex: xa((e) => RegExp(`^ {0,${e}}>`))
}, Ca = /^(?:[ \t]*(?:\n|$))+/, wa = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, Ta = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, Ea = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Da = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, Oa = / {0,3}(?:[*+-]|\d{1,9}[.)])/, ka = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, Aa = Y(ka).replace(/bull/g, Oa).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), ja = Y(ka).replace(/bull/g, Oa).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), Ma = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/, Na = /^[^\n]+/, Pa = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, Fa = Y(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", Pa).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Ia = Y(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, Oa).getRegex(), La = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", Ra = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, za = Y("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", Ra).replace("tag", La).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), Ba = (e) => Y(Ma).replace("hr", Ea).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", e).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", La).getRegex(), Va = Ba(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/), Ha = Ba(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/), Ua = {
	blockquote: Y(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Ha).getRegex(),
	code: wa,
	def: Fa,
	fences: Ta,
	heading: Da,
	hr: Ea,
	html: za,
	lheading: Aa,
	list: Ia,
	newline: Ca,
	paragraph: Va,
	table: ba,
	text: Na
}, Wa = Y("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", Ea).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", La).getRegex(), Ga = {
	...Ua,
	lheading: ja,
	table: Wa,
	paragraph: Y(Ma).replace("hr", Ea).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Wa).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", La).getRegex()
}, Ka = {
	...Ua,
	html: Y("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment", Ra).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
	def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
	heading: /^(#{1,6})(.*)(?:\n+|$)/,
	fences: ba,
	lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
	paragraph: Y(Ma).replace("hr", Ea).replace("heading", " *#{1,6} *[^\n]").replace("lheading", Aa).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, qa = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Ja = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Ya = /^( {2,}|\\)\n(?!\s*$)/, Xa = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Za = /[\p{P}\p{S}]/u, Qa = /[\s\p{P}\p{S}]/u, $a = /[^\s\p{P}\p{S}]/u, eo = Y(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Qa).getRegex(), to = /[\p{Pi}\p{Ps}"']/u, no = /(?!~)[\p{P}\p{S}]/u, ro = /(?!~)[\s\p{P}\p{S}]/u, io = /(?:[^\s\p{P}\p{S}]|~)/u, ao = Y(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Sa ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), oo = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, so = Y(oo, "u").replace(/punct/g, Za).getRegex(), co = Y(oo, "u").replace(/punct/g, no).getRegex(), lo = Y(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, "u").replace(/openQuote/g, to).replace(/punct/g, Za).getRegex(), uo = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", fo = Y(uo, "gu").replace(/notPunctSpace/g, $a).replace(/punctSpace/g, Qa).replace(/punct/g, Za).getRegex(), po = Y(uo, "gu").replace(/notPunctSpace/g, io).replace(/punctSpace/g, ro).replace(/punct/g, no).getRegex(), mo = Y("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, $a).replace(/punctSpace/g, Qa).replace(/punct/g, Za).getRegex(), ho = Y("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, $a).replace(/punctSpace/g, Qa).replace(/punct/g, Za).getRegex(), go = Y("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, $a).replace(/punctSpace/g, Qa).replace(/punct/g, Za).getRegex(), _o = Y(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, Za).getRegex(), vo = Y("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, $a).replace(/punctSpace/g, Qa).replace(/punct/g, Za).getRegex(), yo = Y(/\\(punct)/, "gu").replace(/punct/g, Za).getRegex(), bo = Y(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), xo = Y(Ra).replace("(?:-->|$)", "-->").getRegex(), So = Y("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", xo).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), Co = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/, wo = Y(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", Co).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), To = Y(/^!?\[(label)\]\[(ref)\]/).replace("label", Co).replace("ref", Pa).getRegex(), Eo = Y(/^!?\[(ref)\](?:\[\])?/).replace("ref", Pa).getRegex(), Do = Y("reflink|nolink(?!\\()", "g").replace("reflink", To).replace("nolink", Eo).getRegex(), Oo = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, ko = {
	_backpedal: ba,
	anyPunctuation: yo,
	autolink: bo,
	blockSkip: ao,
	br: Ya,
	code: Ja,
	del: ba,
	delLDelim: ba,
	delRDelim: ba,
	emStrongLDelim: so,
	emStrongRDelimAst: fo,
	emStrongRDelimUnd: ho,
	escape: qa,
	link: wo,
	nolink: Eo,
	punctuation: eo,
	reflink: To,
	reflinkSearch: Do,
	tag: So,
	text: Xa,
	url: ba
}, Ao = {
	...ko,
	emStrongLDelim: lo,
	emStrongRDelimAst: mo,
	emStrongRDelimUnd: go,
	link: Y(/^!?\[(label)\]\((.*?)\)/).replace("label", Co).getRegex(),
	reflink: Y(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", Co).getRegex()
}, jo = {
	...ko,
	emStrongRDelimAst: po,
	emStrongLDelim: co,
	delLDelim: _o,
	delRDelim: vo,
	url: Y(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", Oo).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
	_backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
	del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
	text: Y(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", Oo).getRegex()
}, Mo = {
	...jo,
	br: Y(Ya).replace("{2,}", "*").getRegex(),
	text: Y(jo.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, No = {
	normal: Ua,
	gfm: Ga,
	pedantic: Ka
}, Po = {
	normal: ko,
	gfm: jo,
	breaks: Mo,
	pedantic: Ao
}, Fo = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
}, Io = (e) => Fo[e];
function Lo(e, t) {
	if (t) {
		if (X.escapeTest.test(e)) return e.replace(X.escapeReplace, Io);
	} else if (X.escapeTestNoEncode.test(e)) return e.replace(X.escapeReplaceNoEncode, Io);
	return e;
}
function Ro(e) {
	try {
		e = encodeURI(e).replace(X.percentDecode, "%");
	} catch {
		return null;
	}
	return e;
}
function zo(e, t) {
	let n = e.replace(X.findPipe, (e, t, n) => {
		let r = !1, i = t;
		for (; --i >= 0 && n[i] === "\\";) r = !r;
		return r ? "|" : " |";
	}).split(X.splitPipe), r = 0;
	if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), t) {
		if (n.length > t) n.splice(t);
		else for (; n.length < t;) n.push("");
	}
	for (; r < n.length; r++) n[r] = n[r].trim().replace(X.slashPipe, "|");
	return n;
}
function Bo(e, t, n) {
	let r = e.length;
	if (r === 0) return "";
	let i = 0;
	for (; i < r;) {
		let a = e.charAt(r - i - 1);
		if (a === t && !n) i++;
		else if (a !== t && n) i++;
		else break;
	}
	return e.slice(0, r - i);
}
function Vo(e) {
	let t = e.split("\n"), n = t.length - 1;
	for (; n >= 0 && X.blankLine.test(t[n]);) n--;
	return t.length - n <= 2 ? e : t.slice(0, n + 1).join("\n");
}
function Ho(e, t) {
	if (e.indexOf(t[1]) === -1) return -1;
	let n = 0;
	for (let r = 0; r < e.length; r++) if (e[r] === "\\") r++;
	else if (e[r] === t[0]) n++;
	else if (e[r] === t[1] && (n--, n < 0)) return r;
	return n > 0 ? -2 : -1;
}
function Uo(e, t = 0) {
	let n = t, r = "";
	for (let t of e) if (t === "	") {
		let e = 4 - n % 4;
		r += " ".repeat(e), n += e;
	} else r += t, n++;
	return r;
}
function Wo(e, t, n, r, i) {
	let a = t.href, o = t.title || null, s = e[1].replace(i.other.outputLinkReplace, "$1");
	r.state.inLink = !0;
	let c = {
		type: e[0].charAt(0) === "!" ? "image" : "link",
		raw: n,
		href: a,
		title: o,
		text: s,
		tokens: r.inlineTokens(s)
	};
	return r.state.inLink = !1, c;
}
function Go(e, t, n) {
	let r = e.match(n.other.indentCodeCompensation);
	if (r === null) return t;
	let i = r[1];
	return t.split("\n").map((e) => {
		let t = e.match(n.other.beginningSpace);
		if (t === null) return e;
		let [r] = t;
		return r.length >= i.length ? e.slice(i.length) : e;
	}).join("\n");
}
var Ko = class {
	options;
	rules;
	lexer;
	constructor(e) {
		this.options = e || va;
	}
	space(e) {
		let t = this.rules.block.newline.exec(e);
		if (t && t[0].length > 0) return {
			type: "space",
			raw: t[0]
		};
	}
	code(e) {
		let t = this.rules.block.code.exec(e);
		if (t) {
			let e = this.options.pedantic ? t[0] : Vo(t[0]);
			return {
				type: "code",
				raw: e,
				codeBlockStyle: "indented",
				text: e.replace(this.rules.other.codeRemoveIndent, "")
			};
		}
	}
	fences(e) {
		let t = this.rules.block.fences.exec(e);
		if (t) {
			let e = t[0], n = Go(e, t[3] || "", this.rules);
			return {
				type: "code",
				raw: e,
				lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
				text: n
			};
		}
	}
	heading(e) {
		let t = this.rules.block.heading.exec(e);
		if (t) {
			let e = t[2].trim();
			if (this.rules.other.endingHash.test(e)) {
				let t = Bo(e, "#");
				(this.options.pedantic || !t || this.rules.other.endingSpaceChar.test(t)) && (e = t.trim());
			}
			return {
				type: "heading",
				raw: Bo(t[0], "\n"),
				depth: t[1].length,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	hr(e) {
		let t = this.rules.block.hr.exec(e);
		if (t) return {
			type: "hr",
			raw: Bo(t[0], "\n")
		};
	}
	blockquote(e) {
		let t = this.rules.block.blockquote.exec(e);
		if (t) {
			let e = Bo(t[0], "\n").split("\n"), n = "", r = "", i = [];
			for (; e.length > 0;) {
				let t = !1, a = [], o;
				for (o = 0; o < e.length; o++) if (this.rules.other.blockquoteStart.test(e[o])) a.push(e[o]), t = !0;
				else if (!t) a.push(e[o]);
				else break;
				e = e.slice(o);
				let s = a.join("\n"), c = s.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
				n = n ? `${n}
${s}` : s, r = r ? `${r}
${c}` : c;
				let l = this.lexer.state.top;
				if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = l, e.length === 0) break;
				let u = i.at(-1);
				if (u?.type === "code") break;
				if (u?.type === "blockquote") {
					let t = u, a = e.join("\n"), o = t.raw + "\n" + a.replace(this.rules.other.blockquoteSetextReplace2, ""), s = this.blockquote(o);
					i[i.length - 1] = s, n = `${n}
${a}`, r = r.substring(0, r.length - t.text.length) + s.text;
					break;
				}
				if (u?.type === "list") {
					let t = u, a = t.raw + "\n" + e.join("\n"), o = this.list(a);
					i[i.length - 1] = o, n = n.substring(0, n.length - u.raw.length) + o.raw, r = r.substring(0, r.length - t.raw.length) + o.raw, e = a.substring(i.at(-1).raw.length).split("\n");
					continue;
				}
			}
			return {
				type: "blockquote",
				raw: n,
				tokens: i,
				text: r
			};
		}
	}
	list(e) {
		let t = this.rules.block.list.exec(e);
		if (t) {
			let n = t[1].trim(), r = n.length > 1, i = {
				type: "list",
				raw: "",
				ordered: r,
				start: r ? +n.slice(0, -1) : "",
				loose: !1,
				items: []
			};
			n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
			let a = this.rules.other.listItemRegex(n), o = !1;
			for (; e;) {
				let n = !1, r = "", s = "";
				if (!(t = a.exec(e)) || this.rules.block.hr.test(e)) break;
				r = t[0], e = e.substring(r.length);
				let c = Uo(t[2].split("\n", 1)[0], t[1].length), l = e.split("\n", 1)[0], u = !c.trim(), d = 0;
				if (this.options.pedantic ? (d = 2, s = c.trimStart()) : u ? d = t[1].length + 1 : (d = c.search(this.rules.other.nonSpaceChar), d = d > 4 ? 1 : d, s = c.slice(d), d += t[1].length), u && this.rules.other.blankLine.test(l) && (r += l + "\n", e = e.substring(l.length + 1), n = !0), !n) {
					let t = this.rules.other.nextBulletRegex(d), n = this.rules.other.hrRegex(d), i = this.rules.other.fencesBeginRegex(d), a = this.rules.other.headingBeginRegex(d), o = this.rules.other.htmlBeginRegex(d), f = this.rules.other.blockquoteBeginRegex(d);
					for (; e;) {
						let p = e.split("\n", 1)[0], m;
						if (l = p, this.options.pedantic ? (l = l.replace(this.rules.other.listReplaceNesting, "  "), m = l) : m = l.replace(this.rules.other.tabCharGlobal, "    "), i.test(l) || a.test(l) || o.test(l) || f.test(l) || t.test(l) || n.test(l)) break;
						if (m.search(this.rules.other.nonSpaceChar) >= d || !l.trim()) s += "\n" + m.slice(d);
						else {
							if (u || c.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || i.test(c) || a.test(c) || n.test(c)) break;
							s += "\n" + l;
						}
						u = !l.trim(), r += p + "\n", e = e.substring(p.length + 1), c = m.slice(d);
					}
				}
				i.loose || (o ? i.loose = !0 : this.rules.other.doubleBlankLine.test(r) && (o = !0)), i.items.push({
					type: "list_item",
					raw: r,
					task: !!this.options.gfm && this.rules.other.listIsTask.test(s),
					loose: !1,
					text: s,
					tokens: []
				}), i.raw += r;
			}
			let s = i.items.at(-1);
			if (s) s.raw = s.raw.trimEnd(), s.text = s.text.trimEnd();
			else return;
			i.raw = i.raw.trimEnd();
			for (let e of i.items) if (this.lexer.state.top = !1, e.tokens = this.lexer.blockTokens(e.text, []), !i.loose) {
				let t = e.tokens.filter((e) => e.type === "space");
				i.loose = t.length > 0 && t.some((e) => this.rules.other.anyLine.test(e.raw));
			}
			for (let e of i.items) {
				let t = e.tokens[0];
				if (e.task && (t?.type === "text" || t?.type === "paragraph")) {
					e.text = e.text.replace(this.rules.other.listReplaceTask, ""), t.raw = t.raw.replace(this.rules.other.listReplaceTask, ""), t.text = t.text.replace(this.rules.other.listReplaceTask, "");
					for (let e = this.lexer.inlineQueue.length - 1; e >= 0; e--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)) {
						this.lexer.inlineQueue[e].src = this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask, "");
						break;
					}
					let n = this.rules.other.listTaskCheckbox.exec(e.raw);
					if (n) {
						let t = {
							type: "checkbox",
							raw: n[0] + " ",
							checked: n[0] !== "[ ]"
						};
						e.checked = t.checked, i.loose ? e.tokens[0] && ["paragraph", "text"].includes(e.tokens[0].type) && "tokens" in e.tokens[0] && e.tokens[0].tokens ? (e.tokens[0].raw = t.raw + e.tokens[0].raw, e.tokens[0].text = t.raw + e.tokens[0].text, e.tokens[0].tokens.unshift(t)) : e.tokens.unshift({
							type: "paragraph",
							raw: t.raw,
							text: t.raw,
							tokens: [t]
						}) : e.tokens.unshift(t);
					}
				} else e.task &&= !1;
			}
			if (i.loose) for (let e of i.items) {
				e.loose = !0;
				for (let t of e.tokens) t.type === "text" && (t.type = "paragraph");
			}
			return i;
		}
	}
	html(e) {
		let t = this.rules.block.html.exec(e);
		if (t) {
			let e = Vo(t[0]);
			return {
				type: "html",
				block: !0,
				raw: e,
				pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
				text: e
			};
		}
	}
	def(e) {
		let t = this.rules.block.def.exec(e);
		if (t) {
			let e = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), n = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
			return {
				type: "def",
				tag: e,
				raw: Bo(t[0], "\n"),
				href: n,
				title: r
			};
		}
	}
	table(e) {
		let t = this.rules.block.table.exec(e);
		if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
		let n = zo(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [], a = {
			type: "table",
			raw: Bo(t[0], "\n"),
			header: [],
			align: [],
			rows: []
		};
		if (n.length === r.length) {
			for (let e of r) this.rules.other.tableAlignRight.test(e) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(e) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(e) ? a.align.push("left") : a.align.push(null);
			for (let e = 0; e < n.length; e++) a.header.push({
				text: n[e],
				tokens: this.lexer.inline(n[e]),
				header: !0,
				align: a.align[e]
			});
			for (let e of i) a.rows.push(zo(e, a.header.length).map((e, t) => ({
				text: e,
				tokens: this.lexer.inline(e),
				header: !1,
				align: a.align[t]
			})));
			return a;
		}
	}
	lheading(e) {
		let t = this.rules.block.lheading.exec(e);
		if (t) {
			let e = t[1].trim();
			return {
				type: "heading",
				raw: Bo(t[0], "\n"),
				depth: t[2].charAt(0) === "=" ? 1 : 2,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	paragraph(e) {
		let t = this.rules.block.paragraph.exec(e);
		if (t) {
			let e = t[1].charAt(t[1].length - 1) === "\n" ? t[1].slice(0, -1) : t[1];
			return {
				type: "paragraph",
				raw: t[0],
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	text(e) {
		let t = this.rules.block.text.exec(e);
		if (t) return {
			type: "text",
			raw: t[0],
			text: t[0],
			tokens: this.lexer.inline(t[0])
		};
	}
	escape(e) {
		let t = this.rules.inline.escape.exec(e);
		if (t) return {
			type: "escape",
			raw: t[0],
			text: t[1]
		};
	}
	tag(e) {
		let t = this.rules.inline.tag.exec(e);
		if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
			type: "html",
			raw: t[0],
			inLink: this.lexer.state.inLink,
			inRawBlock: this.lexer.state.inRawBlock,
			block: !1,
			text: t[0]
		};
	}
	link(e) {
		let t = this.rules.inline.link.exec(e);
		if (t) {
			let e = t[2].trim();
			if (!this.options.pedantic && this.rules.other.startAngleBracket.test(e)) {
				if (!this.rules.other.endAngleBracket.test(e)) return;
				let t = Bo(e.slice(0, -1), "\\");
				if ((e.length - t.length) % 2 == 0) return;
			} else {
				let e = Ho(t[2], "()");
				if (e === -2) return;
				if (e > -1) {
					let n = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + e;
					t[2] = t[2].substring(0, e), t[0] = t[0].substring(0, n).trim(), t[3] = "";
				}
			}
			let n = t[2], r = "";
			if (this.options.pedantic) {
				let e = this.rules.other.pedanticHrefTitle.exec(n);
				e && (n = e[1], r = e[3]);
			} else r = t[3] ? t[3].slice(1, -1) : "";
			return n = n.trim(), this.rules.other.startAngleBracket.test(n) && (n = this.options.pedantic && !this.rules.other.endAngleBracket.test(e) ? n.slice(1) : n.slice(1, -1)), Wo(t, {
				href: n && n.replace(this.rules.inline.anyPunctuation, "$1"),
				title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
			}, t[0], this.lexer, this.rules);
		}
	}
	reflink(e, t) {
		let n;
		if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
			let e = t[(n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " ").toLowerCase()];
			if (!e) {
				let e = n[0].charAt(0);
				return {
					type: "text",
					raw: e,
					text: e
				};
			}
			return Wo(n, e, n[0], this.lexer, this.rules);
		}
	}
	emStrong(e, t, n = "") {
		let r = this.rules.inline.emStrongLDelim.exec(e);
		if (!(!r || !r[1] && !r[2] && !r[3] && !r[4] || r[4] && n.match(this.rules.other.unicodeAlphaNumeric)) && (!(r[1] || r[3]) || !n || this.rules.inline.punctuation.exec(n))) {
			let i = [...r[0]].length - 1, a, o, s = i, c = 0, l = r[0][0], u = n === l, d = l === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
			for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (r = d.exec(t)) !== null;) {
				if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a) continue;
				if (o = [...a].length, r[3] || r[4]) {
					s += o;
					continue;
				}
				if (r[5] || r[6]) {
					if (i % 3 && !((i + o) % 3)) {
						c += o;
						continue;
					}
					if (u) break;
				}
				if (s -= o, s > 0) continue;
				o = Math.min(o, o + s + c);
				let t = [...r[0]][0].length, n = e.slice(0, i + r.index + t + o);
				if (Math.min(i, o) % 2) {
					let e = n.slice(1, -1);
					return {
						type: "em",
						raw: n,
						text: e,
						tokens: this.lexer.inlineTokens(e)
					};
				}
				let l = n.slice(2, -2);
				return {
					type: "strong",
					raw: n,
					text: l,
					tokens: this.lexer.inlineTokens(l)
				};
			}
		}
	}
	codespan(e) {
		let t = this.rules.inline.code.exec(e);
		if (t) {
			let e = t[2].replace(this.rules.other.newLineCharGlobal, " "), n = this.rules.other.nonSpaceChar.test(e), r = this.rules.other.startingSpaceChar.test(e) && this.rules.other.endingSpaceChar.test(e);
			return n && r && (e = e.substring(1, e.length - 1)), {
				type: "codespan",
				raw: t[0],
				text: e
			};
		}
	}
	br(e) {
		let t = this.rules.inline.br.exec(e);
		if (t) return {
			type: "br",
			raw: t[0]
		};
	}
	del(e, t, n = "") {
		let r = this.rules.inline.delLDelim.exec(e);
		if (r && (!r[1] || !n || this.rules.inline.punctuation.exec(n))) {
			let n = [...r[0]].length - 1, i, a, o = n, s = this.rules.inline.delRDelim;
			for (s.lastIndex = 0, t = t.slice(-1 * e.length + n); (r = s.exec(t)) !== null;) {
				if (i = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !i || (a = [...i].length, a !== n)) continue;
				if (r[3] || r[4]) {
					o += a;
					continue;
				}
				if (o -= a, o > 0) continue;
				a = Math.min(a, a + o);
				let t = [...r[0]][0].length, s = e.slice(0, n + r.index + t + a), c = s.slice(n, -n);
				return {
					type: "del",
					raw: s,
					text: c,
					tokens: this.lexer.inlineTokens(c)
				};
			}
		}
	}
	autolink(e) {
		let t = this.rules.inline.autolink.exec(e);
		if (t) {
			let e, n;
			return t[2] === "@" ? (e = t[1], n = "mailto:" + e) : (e = t[1], n = e), {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	url(e) {
		let t;
		if (t = this.rules.inline.url.exec(e)) {
			let e, n;
			if (t[2] === "@") e = t[0], n = "mailto:" + e;
			else {
				let r;
				do
					r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
				while (r !== t[0]);
				e = t[0], n = t[1] === "www." ? "http://" + t[0] : t[0];
			}
			return {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	inlineText(e) {
		let t = this.rules.inline.text.exec(e);
		if (t) {
			let e = this.lexer.state.inRawBlock;
			return {
				type: "text",
				raw: t[0],
				text: t[0],
				escaped: e
			};
		}
	}
}, qo = class e {
	tokens;
	options;
	state;
	inlineQueue;
	tokenizer;
	constructor(e) {
		this.tokens = [], this.tokens.links = Object.create(null), this.options = e || va, this.options.tokenizer = this.options.tokenizer || new Ko(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
			inLink: !1,
			inRawBlock: !1,
			top: !0
		};
		let t = {
			other: X,
			block: No.normal,
			inline: Po.normal
		};
		this.options.pedantic ? (t.block = No.pedantic, t.inline = Po.pedantic) : this.options.gfm && (t.block = No.gfm, t.inline = this.options.breaks ? Po.breaks : Po.gfm), this.tokenizer.rules = t;
	}
	static get rules() {
		return {
			block: No,
			inline: Po
		};
	}
	static lex(t, n) {
		return new e(n).lex(t);
	}
	static lexInline(t, n) {
		return new e(n).inlineTokens(t);
	}
	lex(e) {
		e = e.replace(X.carriageReturn, "\n"), this.blockTokens(e, this.tokens);
		for (let e = 0; e < this.inlineQueue.length; e++) {
			let t = this.inlineQueue[e];
			this.inlineTokens(t.src, t.tokens);
		}
		return this.inlineQueue = [], this.tokens;
	}
	blockTokens(e, t = [], n = !1) {
		this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(X.tabCharGlobal, "    ").replace(X.spaceLine, ""));
		let r = 1 / 0;
		for (; e;) {
			if (e.length < r) r = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			let i;
			if (this.options.extensions?.block?.some((n) => (i = n.call({ lexer: this }, e, t)) ? (e = e.substring(i.raw.length), t.push(i), !0) : !1)) continue;
			if (i = this.tokenizer.space(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				i.raw.length === 1 && n !== void 0 ? n.raw += "\n" : t.push(i);
				continue;
			}
			if (i = this.tokenizer.code(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if (i = this.tokenizer.fences(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.heading(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.hr(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.blockquote(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.list(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.html(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.def(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.raw, this.inlineQueue.at(-1).src = n.text) : this.tokens.links[i.tag] || (this.tokens.links[i.tag] = {
					href: i.href,
					title: i.title
				}, t.push(i));
				continue;
			}
			if (i = this.tokenizer.table(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.lheading(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			let a = e;
			if (this.options.extensions?.startBlock) {
				let t = 1 / 0, n = e.slice(1), r;
				this.options.extensions.startBlock.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < 1 / 0 && t >= 0 && (a = e.substring(0, t + 1));
			}
			if (this.state.top && (i = this.tokenizer.paragraph(a))) {
				let r = t.at(-1);
				n && r?.type === "paragraph" ? (r.raw += (r.raw.endsWith("\n") ? "" : "\n") + i.raw, r.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = r.text) : t.push(i), n = a.length !== e.length, e = e.substring(i.raw.length);
				continue;
			}
			if (i = this.tokenizer.text(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return this.state.top = !0, t;
	}
	inline(e, t = []) {
		return this.inlineQueue.push({
			src: e,
			tokens: t
		}), t;
	}
	inlineTokens(e, t = []) {
		this.tokenizer.lexer = this;
		let n = e;
		if (this.tokens.links) {
			let e = Object.keys(this.tokens.links);
			e.length > 0 && (n = n.replace(this.tokenizer.rules.inline.reflinkSearch, (t) => e.includes(t.slice(t.lastIndexOf("[") + 1, -1)) ? "[" + "a".repeat(t.length - 2) + "]" : t));
		}
		n = n.replace(this.tokenizer.rules.inline.anyPunctuation, (e) => "+".repeat(e.length)), n = n.replace(this.tokenizer.rules.inline.blockSkip, (e, t, n) => {
			let r = n ? n.length : 0;
			return e.slice(0, r) + "[" + "a".repeat(e.length - r - 2) + "]";
		}), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
		let r = !1, i = "", a = 1 / 0;
		for (; e;) {
			if (e.length < a) a = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			r || (i = ""), r = !1;
			let o;
			if (this.options.extensions?.inline?.some((n) => (o = n.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1)) continue;
			if (o = this.tokenizer.escape(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.tag(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.link(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.reflink(e, this.tokens.links)) {
				e = e.substring(o.raw.length);
				let n = t.at(-1);
				o.type === "text" && n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if (o = this.tokenizer.emStrong(e, n, i)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.codespan(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.br(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.del(e, n, i)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.autolink(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (!this.state.inLink && (o = this.tokenizer.url(e))) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			let s = e;
			if (this.options.extensions?.startInline) {
				let t = 1 / 0, n = e.slice(1), r;
				this.options.extensions.startInline.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < 1 / 0 && t >= 0 && (s = e.substring(0, t + 1));
			}
			if (o = this.tokenizer.inlineText(s)) {
				e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (i = o.raw.slice(-1)), r = !0;
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return t;
	}
	infiniteLoopError(e) {
		let t = "Infinite loop on byte: " + e;
		if (this.options.silent) console.error(t);
		else throw Error(t);
	}
}, Jo = class {
	options;
	parser;
	constructor(e) {
		this.options = e || va;
	}
	space(e) {
		return "";
	}
	code({ text: e, lang: t, escaped: n }) {
		let r = (t || "").match(X.notSpaceStart)?.[0], i = e.replace(X.endingNewline, "") + "\n";
		return r ? "<pre><code class=\"language-" + Lo(r) + "\">" + (n ? i : Lo(i, !0)) + "</code></pre>\n" : "<pre><code>" + (n ? i : Lo(i, !0)) + "</code></pre>\n";
	}
	blockquote({ tokens: e }) {
		return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
	}
	html({ text: e }) {
		return e;
	}
	def(e) {
		return "";
	}
	heading({ tokens: e, depth: t }) {
		return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
	}
	hr(e) {
		return "<hr>\n";
	}
	list(e) {
		let t = e.ordered, n = e.start, r = "";
		for (let t = 0; t < e.items.length; t++) {
			let n = e.items[t];
			r += this.listitem(n);
		}
		let i = t ? "ol" : "ul", a = t && n !== 1 ? " start=\"" + n + "\"" : "";
		return "<" + i + a + ">\n" + r + "</" + i + ">\n";
	}
	listitem(e) {
		return `<li>${this.parser.parse(e.tokens)}</li>
`;
	}
	checkbox({ checked: e }) {
		return "<input " + (e ? "checked=\"\" " : "") + "disabled=\"\" type=\"checkbox\"> ";
	}
	paragraph({ tokens: e }) {
		return `<p>${this.parser.parseInline(e)}</p>
`;
	}
	table(e) {
		let t = "", n = "";
		for (let t = 0; t < e.header.length; t++) n += this.tablecell(e.header[t]);
		t += this.tablerow({ text: n });
		let r = "";
		for (let t = 0; t < e.rows.length; t++) {
			let i = e.rows[t];
			n = "";
			for (let e = 0; e < i.length; e++) n += this.tablecell(i[e]);
			r += this.tablerow({ text: n });
		}
		return r &&= `<tbody>${r}</tbody>`, "<table>\n<thead>\n" + t + "</thead>\n" + r + "</table>\n";
	}
	tablerow({ text: e }) {
		return `<tr>
${e}</tr>
`;
	}
	tablecell(e) {
		let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
		return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
	}
	strong({ tokens: e }) {
		return `<strong>${this.parser.parseInline(e)}</strong>`;
	}
	em({ tokens: e }) {
		return `<em>${this.parser.parseInline(e)}</em>`;
	}
	codespan({ text: e }) {
		return `<code>${Lo(e, !0)}</code>`;
	}
	br(e) {
		return "<br>";
	}
	del({ tokens: e }) {
		return `<del>${this.parser.parseInline(e)}</del>`;
	}
	link({ href: e, title: t, tokens: n }) {
		let r = this.parser.parseInline(n), i = Ro(e);
		if (i === null) return r;
		e = i;
		let a = "<a href=\"" + e + "\"";
		return t && (a += " title=\"" + Lo(t) + "\""), a += ">" + r + "</a>", a;
	}
	image({ href: e, title: t, text: n, tokens: r }) {
		r && (n = this.parser.parseInline(r, this.parser.textRenderer));
		let i = Ro(e);
		if (i === null) return Lo(n);
		e = i;
		let a = `<img src="${e}" alt="${Lo(n)}"`;
		return t && (a += ` title="${Lo(t)}"`), a += ">", a;
	}
	text(e) {
		return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Lo(e.text);
	}
}, Yo = class {
	strong({ text: e }) {
		return e;
	}
	em({ text: e }) {
		return e;
	}
	codespan({ text: e }) {
		return e;
	}
	del({ text: e }) {
		return e;
	}
	html({ text: e }) {
		return e;
	}
	text({ text: e }) {
		return e;
	}
	link({ text: e }) {
		return "" + e;
	}
	image({ text: e }) {
		return "" + e;
	}
	br() {
		return "";
	}
	checkbox({ raw: e }) {
		return e;
	}
}, Xo = class e {
	options;
	renderer;
	textRenderer;
	constructor(e) {
		this.options = e || va, this.options.renderer = this.options.renderer || new Jo(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new Yo();
	}
	static parse(t, n) {
		return new e(n).parse(t);
	}
	static parseInline(t, n) {
		return new e(n).parseInline(t);
	}
	parse(e) {
		this.renderer.parser = this;
		let t = "";
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (this.options.extensions?.renderers?.[r.type]) {
				let e = r, n = this.options.extensions.renderers[e.type].call({ parser: this }, e);
				if (n !== !1 || ![
					"space",
					"hr",
					"heading",
					"code",
					"table",
					"blockquote",
					"list",
					"checkbox",
					"html",
					"def",
					"paragraph",
					"text"
				].includes(e.type)) {
					t += n || "";
					continue;
				}
			}
			let i = r;
			switch (i.type) {
				case "space":
					t += this.renderer.space(i);
					break;
				case "hr":
					t += this.renderer.hr(i);
					break;
				case "heading":
					t += this.renderer.heading(i);
					break;
				case "code":
					t += this.renderer.code(i);
					break;
				case "table":
					t += this.renderer.table(i);
					break;
				case "blockquote":
					t += this.renderer.blockquote(i);
					break;
				case "list":
					t += this.renderer.list(i);
					break;
				case "checkbox":
					t += this.renderer.checkbox(i);
					break;
				case "html":
					t += this.renderer.html(i);
					break;
				case "def":
					t += this.renderer.def(i);
					break;
				case "paragraph":
					t += this.renderer.paragraph(i);
					break;
				case "text":
					t += this.renderer.text(i);
					break;
				default: {
					let e = "Token with \"" + i.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return t;
	}
	parseInline(e, t = this.renderer) {
		this.renderer.parser = this;
		let n = "";
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (this.options.extensions?.renderers?.[i.type]) {
				let e = this.options.extensions.renderers[i.type].call({ parser: this }, i);
				if (e !== !1 || ![
					"escape",
					"html",
					"link",
					"image",
					"checkbox",
					"strong",
					"em",
					"codespan",
					"br",
					"del",
					"text"
				].includes(i.type)) {
					n += e || "";
					continue;
				}
			}
			let a = i;
			switch (a.type) {
				case "escape":
					n += t.text(a);
					break;
				case "html":
					n += t.html(a);
					break;
				case "link":
					n += t.link(a);
					break;
				case "image":
					n += t.image(a);
					break;
				case "checkbox":
					n += t.checkbox(a);
					break;
				case "strong":
					n += t.strong(a);
					break;
				case "em":
					n += t.em(a);
					break;
				case "codespan":
					n += t.codespan(a);
					break;
				case "br":
					n += t.br(a);
					break;
				case "del":
					n += t.del(a);
					break;
				case "text":
					n += t.text(a);
					break;
				default: {
					let e = "Token with \"" + a.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return n;
	}
}, Zo = class {
	options;
	block;
	constructor(e) {
		this.options = e || va;
	}
	static passThroughHooks = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens",
		"emStrongMask"
	]);
	static passThroughHooksRespectAsync = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens"
	]);
	preprocess(e) {
		return e;
	}
	postprocess(e) {
		return e;
	}
	processAllTokens(e) {
		return e;
	}
	emStrongMask(e) {
		return e;
	}
	provideLexer(e = this.block) {
		return e ? qo.lex : qo.lexInline;
	}
	provideParser(e = this.block) {
		return e ? Xo.parse : Xo.parseInline;
	}
}, Qo = class {
	defaults = _a();
	options = this.setOptions;
	parse = this.parseMarkdown(!0);
	parseInline = this.parseMarkdown(!1);
	Parser = Xo;
	Renderer = Jo;
	TextRenderer = Yo;
	Lexer = qo;
	Tokenizer = Ko;
	Hooks = Zo;
	constructor(...e) {
		this.use(...e);
	}
	walkTokens(e, t) {
		let n = [];
		for (let r of e) switch (n = n.concat(t.call(this, r)), r.type) {
			case "table": {
				let e = r;
				for (let r of e.header) n = n.concat(this.walkTokens(r.tokens, t));
				for (let r of e.rows) for (let e of r) n = n.concat(this.walkTokens(e.tokens, t));
				break;
			}
			case "list": {
				let e = r;
				n = n.concat(this.walkTokens(e.items, t));
				break;
			}
			default: {
				let e = r;
				this.defaults.extensions?.childTokens?.[e.type] ? this.defaults.extensions.childTokens[e.type].forEach((r) => {
					let i = e[r].flat(1 / 0);
					n = n.concat(this.walkTokens(i, t));
				}) : e.tokens && (n = n.concat(this.walkTokens(e.tokens, t)));
			}
		}
		return n;
	}
	use(...e) {
		let t = this.defaults.extensions || {
			renderers: {},
			childTokens: {}
		};
		return e.forEach((e) => {
			let n = { ...e };
			if (n.async = this.defaults.async || n.async || !1, e.extensions && (e.extensions.forEach((e) => {
				if (!e.name) throw Error("extension name required");
				if ("renderer" in e) {
					let n = t.renderers[e.name];
					n ? t.renderers[e.name] = function(...t) {
						let r = e.renderer.apply(this, t);
						return r === !1 && (r = n.apply(this, t)), r;
					} : t.renderers[e.name] = e.renderer;
				}
				if ("tokenizer" in e) {
					if (!e.level || e.level !== "block" && e.level !== "inline") throw Error("extension level must be 'block' or 'inline'");
					let n = t[e.level];
					n ? n.unshift(e.tokenizer) : t[e.level] = [e.tokenizer], e.start && (e.level === "block" ? t.startBlock ? t.startBlock.push(e.start) : t.startBlock = [e.start] : e.level === "inline" && (t.startInline ? t.startInline.push(e.start) : t.startInline = [e.start]));
				}
				"childTokens" in e && e.childTokens && (t.childTokens[e.name] = e.childTokens);
			}), n.extensions = t), e.renderer) {
				let t = this.defaults.renderer || new Jo(this.defaults);
				for (let n in e.renderer) {
					if (!(n in t)) throw Error(`renderer '${n}' does not exist`);
					if (["options", "parser"].includes(n)) continue;
					let r = n, i = e.renderer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n || "";
					};
				}
				n.renderer = t;
			}
			if (e.tokenizer) {
				let t = this.defaults.tokenizer || new Ko(this.defaults);
				for (let n in e.tokenizer) {
					if (!(n in t)) throw Error(`tokenizer '${n}' does not exist`);
					if ([
						"options",
						"rules",
						"lexer"
					].includes(n)) continue;
					let r = n, i = e.tokenizer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.tokenizer = t;
			}
			if (e.hooks) {
				let t = this.defaults.hooks || new Zo();
				for (let n in e.hooks) {
					if (!(n in t)) throw Error(`hook '${n}' does not exist`);
					if (["options", "block"].includes(n)) continue;
					let r = n, i = e.hooks[r], a = t[r];
					t[r] = Zo.passThroughHooks.has(n) ? (e) => {
						if (this.defaults.async && Zo.passThroughHooksRespectAsync.has(n)) return (async () => {
							let n = await i.call(t, e);
							return a.call(t, n);
						})();
						let r = i.call(t, e);
						return a.call(t, r);
					} : (...e) => {
						if (this.defaults.async) return (async () => {
							let n = await i.apply(t, e);
							return n === !1 && (n = await a.apply(t, e)), n;
						})();
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.hooks = t;
			}
			if (e.walkTokens) {
				let t = this.defaults.walkTokens, r = e.walkTokens;
				n.walkTokens = function(e) {
					let n = [];
					return n.push(r.call(this, e)), t && (n = n.concat(t.call(this, e))), n;
				};
			}
			this.defaults = {
				...this.defaults,
				...n
			};
		}), this;
	}
	setOptions(e) {
		return this.defaults = {
			...this.defaults,
			...e
		}, this;
	}
	lexer(e, t) {
		return qo.lex(e, t ?? this.defaults);
	}
	parser(e, t) {
		return Xo.parse(e, t ?? this.defaults);
	}
	parseMarkdown(e) {
		return (t, n) => {
			let r = { ...n }, i = {
				...this.defaults,
				...r
			}, a = this.onError(!!i.silent, !!i.async);
			if (this.defaults.async === !0 && r.async === !1) return a(/* @__PURE__ */ Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
			if (typeof t > "u" || t === null) return a(/* @__PURE__ */ Error("marked(): input parameter is undefined or null"));
			if (typeof t != "string") return a(/* @__PURE__ */ Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected"));
			if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
				let n = i.hooks ? await i.hooks.preprocess(t) : t, r = await (i.hooks ? await i.hooks.provideLexer(e) : e ? qo.lex : qo.lexInline)(n, i), a = i.hooks ? await i.hooks.processAllTokens(r) : r;
				i.walkTokens && await Promise.all(this.walkTokens(a, i.walkTokens));
				let o = await (i.hooks ? await i.hooks.provideParser(e) : e ? Xo.parse : Xo.parseInline)(a, i);
				return i.hooks ? await i.hooks.postprocess(o) : o;
			})().catch(a);
			try {
				i.hooks && (t = i.hooks.preprocess(t));
				let n = (i.hooks ? i.hooks.provideLexer(e) : e ? qo.lex : qo.lexInline)(t, i);
				i.hooks && (n = i.hooks.processAllTokens(n)), i.walkTokens && this.walkTokens(n, i.walkTokens);
				let r = (i.hooks ? i.hooks.provideParser(e) : e ? Xo.parse : Xo.parseInline)(n, i);
				return i.hooks && (r = i.hooks.postprocess(r)), r;
			} catch (e) {
				return a(e);
			}
		};
	}
	onError(e, t) {
		return (n) => {
			if (n.message += "\nPlease report this to https://github.com/markedjs/marked.", e) {
				let e = "<p>An error occurred:</p><pre>" + Lo(n.message + "", !0) + "</pre>";
				return t ? Promise.resolve(e) : e;
			}
			if (t) return Promise.reject(n);
			throw n;
		};
	}
}, $o = new Qo();
function Z(e, t) {
	return $o.parse(e, t);
}
Z.options = Z.setOptions = function(e) {
	return $o.setOptions(e), Z.defaults = $o.defaults, ya(Z.defaults), Z;
}, Z.getDefaults = _a, Z.defaults = va;
function es(...e) {
	return $o.use(...e), Z.defaults = $o.defaults, ya(Z.defaults), Z;
}
Z.use = es, Z.walkTokens = function(e, t) {
	return $o.walkTokens(e, t);
}, Z.parseInline = $o.parseInline, Z.Parser = Xo, Z.parser = Xo.parse, Z.Renderer = Jo, Z.TextRenderer = Yo, Z.Lexer = qo, Z.lexer = qo.lex, Z.Tokenizer = Ko, Z.Hooks = Zo, Z.parse = Z, Z.options, Z.setOptions, Z.walkTokens, Z.parseInline, Xo.parse, qo.lex;
//#endregion
//#region src/presentation.ts
var ts = {
	accept: "Continue",
	agentName: (e) => e ? `${ns(e)} Agent` : "Agent",
	agentOngoing: "Ongoing",
	agentCompleted: "Completed",
	agentFailed: "Failed",
	agentCancelled: "Cancelled",
	agentBackground: "Started in background",
	agentObserved: (e) => `Observed ${e}`,
	assistantName: "Assistant",
	authRequired: "Authentication required",
	cancel: "Cancel",
	close: "Close",
	composerPlaceholder: "Ask anything…",
	context: "Context",
	decline: "Decline",
	deleteSession: "Delete session",
	emptyDescription: "Messages, tool activity, and plans will appear here.",
	emptyTitle: "Start a conversation",
	error: "Something went wrong",
	finish: "I've finished",
	historyGap: "Earlier messages are unavailable for this session.",
	historyGapTitle: "Partial history",
	loadMore: "Load more",
	newChat: "New chat",
	noSessions: "No previous sessions",
	openLink: "Open link",
	openChildSession: "Open child session",
	permission: "Permission required",
	retry: "Retry",
	send: "Send",
	sessionUntitled: "Untitled session",
	sessions: "Sessions",
	stop: "Stop",
	thinking: "Think",
	tool: "Tool",
	unsupportedContent: (e) => `Unsupported agent content: ${e}`,
	you: "You",
	confirmDeleteSession: (e) => `Delete “${e}”?`,
	backToSession: (e) => `Back to ${e}`
};
function ns(e) {
	return e.replaceAll(/[_-]+/g, " ").trim().replaceAll(/(^|\s)\S/g, (e) => e.toUpperCase());
}
//#endregion
//#region node_modules/.pnpm/preact@10.29.8/node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var rs = 0;
Array.isArray;
function Q(e, t, n, r, i, a) {
	t ||= {};
	var o, s, c = t;
	if ("ref" in c) for (s in c = {}, t) s == "ref" ? o = t[s] : c[s] = t[s];
	var l = {
		type: e,
		props: c,
		key: n,
		ref: o,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__c: null,
		constructor: void 0,
		__v: --rs,
		__i: -1,
		__u: 0,
		__source: i,
		__self: a
	};
	if (typeof e == "function" && (o = e.defaultProps)) for (s in o) c[s] === void 0 && (c[s] = o[s]);
	return O.vnode && O.vnode(l), l;
}
//#endregion
//#region src/react/Chat.tsx
var is = It(void 0), as = /* @__PURE__ */ new WeakMap(), os = 0, ss = {
	phase: "connecting",
	sessionTrail: [],
	historyGap: !1,
	activities: [],
	contextItems: [],
	configOptions: [],
	commands: [],
	interactions: [],
	authMethods: [],
	capabilities: {
		listSessions: !1,
		loadSession: !1,
		resumeSession: !1,
		closeSession: !1,
		deleteSession: !1
	}
}, cs = {
	ready: new Promise(() => void 0),
	getSnapshot: () => ss,
	subscribe: () => () => void 0,
	send() {
		throw Error("The chat session is still connecting");
	},
	async cancel() {},
	async reconnect() {},
	async newSession() {},
	async listSessions() {
		return { sessions: [] };
	},
	async openSession() {},
	async openChildSession() {},
	async openAncestorSession() {},
	async closeSession() {},
	async deleteSession() {},
	async setConfigOption() {},
	async authenticate() {},
	async logout() {},
	respondPermission: () => !1,
	respondElicitation: () => !1,
	async destroy() {}
};
function ls(e) {
	let t = tn(is);
	if (!t) throw Error(`pretty-aui: ${e} must be rendered inside a ChatRoot.`);
	return t;
}
function us(e) {
	return /* @__PURE__ */ Q(ds, {
		...e,
		children: [
			/* @__PURE__ */ Q(ms, {}),
			/* @__PURE__ */ Q(hs, {}),
			/* @__PURE__ */ Q(gs, {}),
			/* @__PURE__ */ Q(Rs, {})
		]
	});
}
function ds(e) {
	if ("controller" in e) {
		let { controller: t, ...n } = e;
		return /* @__PURE__ */ Q(ps, {
			...n,
			controller: t
		}, ec(t));
	}
	let { options: t, ...n } = e;
	return /* @__PURE__ */ Q(fs, {
		...n,
		options: t
	});
}
function fs(e) {
	let { options: t, ...n } = e, r = F(t), [i, a] = Yt();
	return Zt(() => {
		let e = Hr(r.current);
		return a(e), () => {
			e.destroy();
		};
	}, []), i ? /* @__PURE__ */ Q(ps, {
		...n,
		controller: i
	}, ec(i)) : /* @__PURE__ */ Q(ps, {
		...n,
		controller: cs
	}, "connecting");
}
function ps(e) {
	let { controller: t } = e, n = pn(en((e) => tc(t, e), [t]), en(() => t.getSnapshot(), [t]), en(() => t.getSnapshot(), [t])), r = $t(() => ({
		...ts,
		...e.labels
	}), [e.labels]), i = nn().replaceAll(":", ""), [a, o] = Yt(), s = en((e) => {
		o(void 0), e().catch((e) => {
			o(e instanceof Error ? e.message : String(e));
		});
	}, []), c = e.colorScheme ?? "system", l = e.surface ?? "inline", u = $t(() => ({
		controller: t,
		snapshot: n,
		labels: r,
		toolActivityRenderer: e.toolActivityRenderer,
		actionError: a,
		runAction: s,
		ids: {
			instance: `paui-${i}`,
			sessionsTitle: `paui-${i}-sessions-title`
		}
	}), [
		a,
		t,
		i,
		r,
		e.toolActivityRenderer,
		s,
		n
	]);
	return /* @__PURE__ */ Q("section", {
		className: ["pretty-aui", e.className].filter(Boolean).join(" "),
		"data-pretty-aui-slot": "root",
		"data-surface": l,
		"data-scheme": c,
		"data-phase": n.phase,
		style: e.style,
		"aria-label": n.agentName ?? r.assistantName,
		children: /* @__PURE__ */ Q(is.Provider, {
			value: u,
			children: e.children
		})
	});
}
function ms() {
	let { controller: e, snapshot: t, labels: n, runAction: r } = ls("ChatHeader"), [i, a] = Yt(!1), o = t.sessionTitle ?? n.sessionUntitled, s = t.sessionTrail.at(-1);
	return /* @__PURE__ */ Q(pt, { children: [/* @__PURE__ */ Q("header", {
		className: "paui-header",
		"data-pretty-aui-slot": "header",
		children: [/* @__PURE__ */ Q("div", {
			className: `paui-identity${s ? " paui-identity--child" : ""}`,
			children: [/* @__PURE__ */ Q("span", {
				className: "paui-presence",
				"data-phase": t.phase,
				"aria-hidden": "true"
			}), s ? /* @__PURE__ */ Q("div", {
				className: "paui-lineage",
				"data-depth": t.sessionTrail.length,
				children: [
					/* @__PURE__ */ Q("button", {
						className: "paui-lineage__back",
						type: "button",
						disabled: t.phase !== "idle",
						"aria-label": n.backToSession(s.title ?? s.sessionId),
						onClick: () => r(() => e.openAncestorSession(s.sessionId)),
						children: /* @__PURE__ */ Q(hc, {})
					}),
					/* @__PURE__ */ Q("div", {
						className: "paui-lineage__titles",
						children: [t.sessionTrail.map((n) => {
							let i = n.title ?? n.sessionId;
							return /* @__PURE__ */ Q("span", {
								className: "paui-lineage__ancestor",
								children: [/* @__PURE__ */ Q("button", {
									type: "button",
									disabled: t.phase !== "idle",
									onClick: () => r(() => e.openAncestorSession(n.sessionId)),
									children: i
								}), /* @__PURE__ */ Q("span", {
									"aria-hidden": "true",
									children: "/"
								})]
							}, n.sessionId);
						}), /* @__PURE__ */ Q("strong", { children: o })]
					}),
					/* @__PURE__ */ Q("span", {
						className: "paui-protocol",
						children: t.protocolVersion ? `ACP v${t.protocolVersion}` : t.phase
					})
				]
			}) : /* @__PURE__ */ Q("div", { children: [/* @__PURE__ */ Q("strong", { children: o }), /* @__PURE__ */ Q("span", {
				className: "paui-protocol",
				children: t.protocolVersion ? `ACP v${t.protocolVersion}` : t.phase
			})] })]
		}), /* @__PURE__ */ Q("div", {
			className: "paui-header__actions",
			children: [t.capabilities.listSessions ? /* @__PURE__ */ Q("button", {
				className: "paui-icon-button",
				type: "button",
				onClick: () => a(!0),
				children: [/* @__PURE__ */ Q(cc, {}), /* @__PURE__ */ Q("span", {
					className: "paui-sr-only",
					children: n.sessions
				})]
			}) : null, /* @__PURE__ */ Q("button", {
				className: "paui-icon-button",
				type: "button",
				disabled: t.phase !== "idle",
				onClick: () => r(() => e.newSession()),
				children: [/* @__PURE__ */ Q(lc, {}), /* @__PURE__ */ Q("span", {
					className: "paui-sr-only",
					children: n.newChat
				})]
			})]
		})]
	}), i ? /* @__PURE__ */ Q(Gs, {
		controller: e,
		snapshot: t,
		labels: n,
		onClose: () => a(!1)
	}) : null] });
}
function hs() {
	let { snapshot: e, labels: t, toolActivityRenderer: n } = ls("ChatTranscript"), r = F(null), i = F(null), a = F(!0), o = F(0), [s, c] = Yt(!0), l = en((e = "auto") => {
		let t = r.current;
		t && (typeof t.scrollTo == "function" ? t.scrollTo({
			top: t.scrollHeight,
			behavior: e
		}) : t.scrollTop = t.scrollHeight, o.current = t.scrollTop, a.current = !0, c(!0));
	}, []), u = en(() => {
		let e = r.current;
		if (!e) return;
		let t = e.scrollHeight - e.scrollTop - e.clientHeight, n = e.scrollTop < o.current - 1, i = t <= 24 || !n && a.current;
		o.current = e.scrollTop, a.current = i, c(i);
	}, []);
	Qt(() => {
		a.current && l();
	}, [
		l,
		e.activities,
		e.historyGap
	]), Zt(() => {
		let e = i.current;
		if (!e || typeof ResizeObserver > "u") return;
		let t = new ResizeObserver(() => {
			a.current && l();
		});
		return t.observe(e), r.current && t.observe(r.current), () => t.disconnect();
	}, [l]);
	let d = $t(() => _s(e.activities), [e.activities]);
	return /* @__PURE__ */ Q("main", {
		ref: r,
		className: "paui-body",
		"data-pretty-aui-slot": "transcript",
		tabIndex: 0,
		onScroll: u,
		children: [/* @__PURE__ */ Q("div", {
			className: "paui-transcript",
			ref: i,
			children: [
				e.historyGap ? /* @__PURE__ */ Q("aside", {
					className: "paui-notice",
					role: "status",
					children: [/* @__PURE__ */ Q(Ac, {}), /* @__PURE__ */ Q("div", { children: [/* @__PURE__ */ Q("strong", { children: t.historyGapTitle }), /* @__PURE__ */ Q("span", { children: t.historyGap })] })]
				}) : null,
				e.activities.length ? null : /* @__PURE__ */ Q("div", {
					className: "paui-empty",
					children: [
						/* @__PURE__ */ Q(jc, {}),
						/* @__PURE__ */ Q("strong", { children: t.emptyTitle }),
						/* @__PURE__ */ Q("p", { children: t.emptyDescription })
					]
				}),
				d.map((r, i) => /* @__PURE__ */ Q(vs, {
					group: r,
					labels: t,
					toolActivityRenderer: n,
					active: i === d.length - 1 && (e.phase === "running" || e.phase === "awaiting_user" || e.phase === "cancelling")
				}, r.id))
			]
		}), s ? null : /* @__PURE__ */ Q("button", {
			className: "paui-to-bottom",
			type: "button",
			onClick: () => l("smooth"),
			"aria-label": "Scroll to latest message",
			children: /* @__PURE__ */ Q(mc, {})
		})]
	});
}
function gs() {
	let { controller: e, snapshot: t, labels: n, actionError: r, runAction: i } = ls("ChatInteractions"), a = F(null);
	return Zt(() => {
		if (!t.interactions.length) return;
		let e = a.current;
		if (!e) return;
		let n = Ks(e);
		n && e.contains(n) || e.querySelector(Js)?.focus();
	}, [t.interactions.map((e) => e.id).join("\0"), t.interactions.length]), /* @__PURE__ */ Q("div", {
		ref: a,
		className: "paui-interactions",
		"data-pretty-aui-slot": "interactions",
		children: [
			t.phase === "auth_required" ? /* @__PURE__ */ Q(Ws, {}) : null,
			t.interactions.map((t) => t.type === "permission" ? /* @__PURE__ */ Q(Bs, {
				interaction: t,
				controller: e,
				labels: n
			}, t.id) : /* @__PURE__ */ Q(Vs, {
				interaction: t,
				controller: e,
				labels: n
			}, t.id)),
			t.error ? /* @__PURE__ */ Q("aside", {
				className: "paui-error",
				role: "alert",
				children: [/* @__PURE__ */ Q("div", { children: [/* @__PURE__ */ Q("strong", { children: n.error }), /* @__PURE__ */ Q("span", { children: t.error.message })] }), t.error.retryable ? /* @__PURE__ */ Q("button", {
					type: "button",
					onClick: () => i(() => e.reconnect()),
					children: n.retry
				}) : null]
			}) : null,
			r && !t.error ? /* @__PURE__ */ Q("aside", {
				className: "paui-error",
				role: "alert",
				children: /* @__PURE__ */ Q("div", { children: [/* @__PURE__ */ Q("strong", { children: n.error }), /* @__PURE__ */ Q("span", { children: r })] })
			}) : null
		]
	});
}
function _s(e) {
	let t = [], n = "opening", r, i = [], a = () => {
		(r || i.length) && t.push({
			id: n,
			...r ? { user: r } : {},
			activities: i
		});
	};
	for (let t of e) t.type === "message" && t.role === "user" ? (a(), n = t.id, r = t, i = []) : i.push(t);
	return a(), t;
}
function vs({ group: e, labels: t, toolActivityRenderer: n, active: r }) {
	return /* @__PURE__ */ Q("article", {
		className: "paui-turn",
		children: [e.user ? /* @__PURE__ */ Q(Ts, {
			message: e.user,
			labels: t
		}) : null, e.activities.length ? /* @__PURE__ */ Q("div", {
			className: "paui-activities",
			children: e.activities.map((i, a) => /* @__PURE__ */ Q(ys, {
				activity: i,
				labels: t,
				toolActivityRenderer: n,
				running: r && a === e.activities.length - 1
			}, i.id))
		}) : null]
	});
}
var ys = gn(function({ activity: e, labels: t, toolActivityRenderer: n, running: r }) {
	return /* @__PURE__ */ Q("div", {
		className: "paui-activity",
		"data-pretty-aui-slot": "activity",
		"data-kind": e.type === "message" ? e.role : e.type === "tool" && e.subagent ? "subagent" : e.type,
		"data-status": rc(e),
		children: /* @__PURE__ */ Q(bs, {
			activity: e,
			labels: t,
			toolActivityRenderer: n,
			running: r
		})
	});
});
function bs({ activity: e, labels: t, toolActivityRenderer: n, running: r }) {
	switch (e.type) {
		case "message": return /* @__PURE__ */ Q(Ts, {
			message: e,
			labels: t,
			running: r
		});
		case "tool": return e.subagent ? /* @__PURE__ */ Q(xs, {
			tool: e,
			labels: t,
			renderer: n
		}) : /* @__PURE__ */ Q("details", {
			className: "paui-disclosure paui-tool",
			"data-state": e.status,
			children: [/* @__PURE__ */ Q("summary", {
				className: "paui-flow-summary",
				children: [
					/* @__PURE__ */ Q(Ds, { icon: /* @__PURE__ */ Q(js, { kind: e.kind }) }),
					/* @__PURE__ */ Q("span", {
						className: "paui-flow-title",
						children: As(e.kind, t.tool)
					}),
					/* @__PURE__ */ Q("span", {
						className: "paui-flow-separator",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ Q("span", {
						className: "paui-flow-preview",
						children: e.title
					}),
					/* @__PURE__ */ Q("span", {
						className: "paui-sr-only",
						children: e.status
					})
				]
			}), /* @__PURE__ */ Q("div", {
				className: "paui-disclosure__body",
				children: /* @__PURE__ */ Q(Ms, {
					tool: e,
					labels: t,
					renderer: n
				})
			})]
		});
		case "plan": return /* @__PURE__ */ Q("details", {
			className: "paui-disclosure paui-plan",
			open: !0,
			children: [/* @__PURE__ */ Q("summary", { children: [
				/* @__PURE__ */ Q(bc, {}),
				/* @__PURE__ */ Q("span", { children: "Plan" }),
				/* @__PURE__ */ Q(sc, { status: nc(e.entries) })
			] }), /* @__PURE__ */ Q("ol", {
				className: "paui-plan__list",
				children: e.entries.map((e, t) => /* @__PURE__ */ Q("li", {
					"data-status": e.status,
					children: [/* @__PURE__ */ Q("span", {
						className: "paui-plan__mark",
						"aria-hidden": "true"
					}), /* @__PURE__ */ Q("span", { children: e.content })]
				}, `${e.content}-${t}`))
			})]
		});
		case "terminal": return /* @__PURE__ */ Q("details", {
			className: "paui-disclosure paui-terminal",
			children: [/* @__PURE__ */ Q("summary", { children: [
				/* @__PURE__ */ Q(wc, {}),
				/* @__PURE__ */ Q("span", { children: e.title }),
				/* @__PURE__ */ Q(sc, { status: e.exited ? "completed" : "in_progress" })
			] }), /* @__PURE__ */ Q("pre", { children: e.output })]
		});
		case "unsupported": return /* @__PURE__ */ Q("div", {
			className: "paui-unsupported",
			children: t.unsupportedContent(e.kind)
		});
	}
}
function xs({ tool: e, labels: t, renderer: n }) {
	let { controller: r, snapshot: i, runAction: a } = ls("ChatTranscript"), o = e.subagent, s = e.status === "pending" || e.status === "in_progress", c = Ss(e.id, s), l = ws(e, t), u = i.capabilities.loadSession || i.capabilities.resumeSession;
	return /* @__PURE__ */ Q("div", {
		className: "paui-subagent-row",
		children: [/* @__PURE__ */ Q("details", {
			className: "paui-disclosure paui-subagent",
			"data-state": e.status,
			"data-running": s || void 0,
			children: [/* @__PURE__ */ Q("summary", {
				className: "paui-flow-summary",
				children: [
					/* @__PURE__ */ Q(Ds, { icon: /* @__PURE__ */ Q(vc, {}) }),
					/* @__PURE__ */ Q("span", {
						className: "paui-flow-title",
						children: t.agentName(o.agent)
					}),
					o.description ? /* @__PURE__ */ Q(pt, { children: [/* @__PURE__ */ Q("span", {
						className: "paui-flow-separator",
						"aria-hidden": "true"
					}), /* @__PURE__ */ Q("span", {
						className: "paui-flow-preview",
						children: o.description
					})] }) : null,
					/* @__PURE__ */ Q("span", {
						className: "paui-subagent-status",
						"data-status": e.status,
						children: [s ? /* @__PURE__ */ Q("span", {
							className: "paui-subagent-status__ongoing",
							children: [/* @__PURE__ */ Q("span", {
								className: "paui-subagent-status__spinner",
								"aria-hidden": "true"
							}), /* @__PURE__ */ Q("span", { children: t.agentOngoing })]
						}) : /* @__PURE__ */ Q("span", { children: l }), c ? /* @__PURE__ */ Q("span", { children: t.agentObserved(c) }) : null]
					})
				]
			}), /* @__PURE__ */ Q("div", {
				className: "paui-disclosure__body",
				children: /* @__PURE__ */ Q(Ms, {
					tool: e,
					labels: t,
					renderer: n
				})
			})]
		}), o.sessionId ? /* @__PURE__ */ Q("button", {
			className: "paui-subagent-open",
			type: "button",
			disabled: !u || i.phase !== "idle",
			"aria-label": t.openChildSession,
			onClick: () => a(() => r.openChildSession(o.sessionId)),
			children: /* @__PURE__ */ Q(yc, {})
		}) : null]
	});
}
function Ss(e, t) {
	let n = F(Date.now()), [r, i] = Yt(n.current);
	return Zt(() => {
		n.current = Date.now(), i(n.current);
	}, [e]), Zt(() => {
		if (!t) return;
		let e = window.setInterval(() => i(Date.now()), 1e3);
		return () => window.clearInterval(e);
	}, [t]), t ? Cs(r - n.current) : void 0;
}
function Cs(e) {
	let t = Math.max(0, Math.floor(e / 1e3));
	if (t < 60) return `${t}s`;
	let n = Math.floor(t / 60), r = t % 60;
	return n < 60 ? `${n}m ${String(r).padStart(2, "0")}s` : `${Math.floor(n / 60)}h ${String(n % 60).padStart(2, "0")}m`;
}
function ws(e, t) {
	return e.subagent?.background && e.status === "completed" ? t.agentBackground : e.status === "completed" ? t.agentCompleted : e.status === "failed" ? t.agentFailed : e.status === "cancelled" ? t.agentCancelled : As(e.status, t.agentCompleted);
}
function Ts({ message: e, labels: t, running: n = !1 }) {
	return e.role === "thought" ? /* @__PURE__ */ Q(Es, {
		message: e,
		labels: t,
		running: n
	}) : /* @__PURE__ */ Q("div", {
		className: "paui-message",
		"data-pretty-aui-slot": "message",
		"data-role": e.role,
		"data-pending": e.pending || void 0,
		"aria-live": e.role === "assistant" && n ? "polite" : void 0,
		"aria-atomic": e.role === "assistant" && n ? "false" : void 0,
		children: [/* @__PURE__ */ Q("span", {
			className: "paui-message__label",
			children: e.role === "user" ? t.you : t.assistantName
		}), /* @__PURE__ */ Q("div", {
			className: "paui-message__content",
			children: e.content.map((e, n) => /* @__PURE__ */ Q(Is, {
				block: e,
				labels: t
			}, n))
		})]
	});
}
function Es({ message: e, labels: t, running: n }) {
	let r = F(null), i = Os(e.content, n);
	return Qt(() => {
		let e = r.current;
		e && (e.scrollLeft = n ? e.scrollWidth - e.clientWidth : 0);
	}, [i, n]), /* @__PURE__ */ Q("details", {
		className: "paui-thought",
		"data-running": n || void 0,
		children: [/* @__PURE__ */ Q("summary", {
			className: "paui-flow-summary",
			children: [
				/* @__PURE__ */ Q(Ds, { icon: /* @__PURE__ */ Q(xc, {}) }),
				/* @__PURE__ */ Q("span", {
					className: "paui-flow-title",
					children: t.thinking
				}),
				i ? /* @__PURE__ */ Q(pt, { children: [/* @__PURE__ */ Q("span", {
					className: "paui-flow-separator",
					"aria-hidden": "true"
				}), /* @__PURE__ */ Q("span", {
					ref: r,
					className: "paui-flow-preview",
					"data-follow-end": n || void 0,
					children: i
				})] }) : null
			]
		}), /* @__PURE__ */ Q("div", {
			className: "paui-thought__body",
			children: e.content.map((e, n) => /* @__PURE__ */ Q(Is, {
				block: e,
				labels: t
			}, n))
		})]
	});
}
function Ds({ icon: e }) {
	return /* @__PURE__ */ Q("span", {
		className: "paui-flow-leading",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ Q("span", {
			className: "paui-flow-icon",
			children: e
		}), /* @__PURE__ */ Q("span", {
			className: "paui-flow-chevron",
			children: /* @__PURE__ */ Q(gc, {})
		})]
	});
}
function Os(e, t) {
	if (t) {
		for (let t = e.length - 1; t >= 0; --t) {
			let n = ks(e[t]).trimEnd();
			if (n) return n.slice(n.lastIndexOf("\n") + 1).replace(/\r$/, "").trim();
		}
		return "";
	}
	let n = e.map(ks).filter(Boolean).join("\n").trimEnd();
	return n ? n.split(/\r?\n/)[0]?.trim() ?? "" : "";
}
function ks(e) {
	return e.type === "text" && typeof e.text == "string" ? e.text : e.type === "resource" && oc(e.resource) && typeof e.resource.text == "string" ? e.resource.text : "";
}
function As(e, t) {
	if (!e) return t;
	let n = e.replaceAll(/[_-]+/g, " ").trim();
	return n ? `${n[0].toUpperCase()}${n.slice(1)}` : t;
}
function js({ kind: e }) {
	let t = e?.toLowerCase() ?? "";
	return t.includes("read") || t.includes("browse") || t.includes("context") ? /* @__PURE__ */ Q(Sc, {}) : t.includes("search") || t.includes("find") ? /* @__PURE__ */ Q(Cc, {}) : t.includes("bash") || t.includes("shell") || t.includes("terminal") || t.includes("execute") ? /* @__PURE__ */ Q(wc, {}) : /* @__PURE__ */ Q(_c, {});
}
function Ms({ tool: e, labels: t, renderer: n }) {
	let r = /* @__PURE__ */ Q(Ns, {
		tool: e,
		labels: t
	});
	return n ? /* @__PURE__ */ Q(Fs, {
		fallback: r,
		resetKey: e.id,
		children: /* @__PURE__ */ Q(Ps, {
			tool: e,
			renderer: n,
			fallback: r
		})
	}, e.id) : r;
}
function Ns({ tool: e, labels: t }) {
	return e.content.length ? e.content.map((e, n) => /* @__PURE__ */ Q(Ls, {
		value: e,
		labels: t
	}, n)) : /* @__PURE__ */ Q("span", {
		className: "paui-muted",
		children: t.tool
	});
}
function Ps({ tool: e, renderer: t, fallback: n }) {
	let r = t(e);
	return r === void 0 ? n : r;
}
var Fs = class extends M {
	state = { failed: !1 };
	static getDerivedStateFromError() {
		return { failed: !0 };
	}
	componentDidCatch(e) {
		console.error("pretty-aui: custom tool renderer failed", e);
	}
	componentDidUpdate(e) {
		this.state.failed && e.resetKey !== this.props.resetKey && this.setState({ failed: !1 });
	}
	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
};
function Is({ block: e, labels: t }) {
	let n = $t(() => e.type === "text" && typeof e.text == "string" ? Xs(e.text) : void 0, [e]);
	if (n !== void 0) return /* @__PURE__ */ Q("div", {
		className: "paui-markdown",
		dangerouslySetInnerHTML: { __html: n }
	});
	if (e.type === "image" && typeof e.data == "string" && typeof e.mimeType == "string" && e.mimeType.startsWith("image/")) return /* @__PURE__ */ Q("img", {
		className: "paui-media",
		src: `data:${e.mimeType};base64,${e.data}`,
		alt: ""
	});
	if (e.type === "audio" && typeof e.data == "string" && typeof e.mimeType == "string" && e.mimeType.startsWith("audio/")) return /* @__PURE__ */ Q("audio", {
		className: "paui-media",
		controls: !0,
		src: `data:${e.mimeType};base64,${e.data}`
	});
	if (e.type === "resource_link" && typeof e.uri == "string") {
		let n = typeof e.title == "string" ? e.title : typeof e.name == "string" ? e.name : e.uri;
		return $s(e.uri) ? /* @__PURE__ */ Q("a", {
			className: "paui-resource",
			href: e.uri,
			target: "_blank",
			rel: "noreferrer",
			children: [/* @__PURE__ */ Q(Ec, {}), /* @__PURE__ */ Q("span", { children: n })]
		}) : /* @__PURE__ */ Q("span", {
			className: "paui-unsupported",
			children: t.unsupportedContent("unsafe resource link")
		});
	}
	if (e.type === "resource" && oc(e.resource)) {
		let t = e.resource, n = typeof t.uri == "string" ? t.uri : "Resource";
		return typeof t.text == "string" ? /* @__PURE__ */ Q("details", {
			className: "paui-resource",
			children: [/* @__PURE__ */ Q("summary", { children: [/* @__PURE__ */ Q(Dc, {}), n] }), /* @__PURE__ */ Q("pre", { children: t.text })]
		}) : /* @__PURE__ */ Q("span", {
			className: "paui-resource",
			children: [/* @__PURE__ */ Q(Dc, {}), n]
		});
	}
	return /* @__PURE__ */ Q("span", {
		className: "paui-unsupported",
		children: t.unsupportedContent(e.type)
	});
}
function Ls({ value: e, labels: t }) {
	if (!oc(e)) return null;
	if (e.type === "content" && oc(e.content) && typeof e.content.type == "string") return /* @__PURE__ */ Q(Is, {
		block: e.content,
		labels: t
	});
	if (e.type === "diff") {
		let t = typeof e.path == "string" ? e.path : "Changed files", n = typeof e.patch == "string" ? e.patch : typeof e.newText == "string" ? e.newText : void 0;
		return /* @__PURE__ */ Q("details", {
			className: "paui-diff",
			children: [/* @__PURE__ */ Q("summary", { children: [/* @__PURE__ */ Q(Oc, {}), t] }), n ? /* @__PURE__ */ Q("pre", { children: n }) : /* @__PURE__ */ Q("span", {
				className: "paui-muted",
				children: "Binary or structural change"
			})]
		});
	}
	return e.type === "terminal" ? /* @__PURE__ */ Q("span", {
		className: "paui-muted",
		children: [/* @__PURE__ */ Q(wc, {}), " Terminal output is shown in the activity stream."]
	}) : /* @__PURE__ */ Q("span", {
		className: "paui-unsupported",
		children: t.unsupportedContent(typeof e.type == "string" ? e.type : "tool result")
	});
}
function Rs() {
	let { controller: e, snapshot: t, labels: n, runAction: r, ids: i } = ls("ChatComposer"), [a, o] = Yt(""), [s, c] = Yt(0), [l, u] = Yt(!1), d = F(!1), f = F(null), p = F(t.sessionId), m = t.activities.length || t.interactions.length || t.phase === "auth_required" || t.error ? "docked" : "hero";
	Zt(() => {
		if (p.current !== t.sessionId) {
			let e = p.current;
			p.current = t.sessionId, e !== void 0 && o("");
		}
	}, [t.sessionId]), Qt(() => {
		let e = f.current;
		e && (e.style.height = "0px", e.style.height = `${Math.min(e.scrollHeight, 336)}px`);
	}, [m, a]);
	let h = !t.sessionId || t.phase === "connecting" || t.phase === "auth_required" || t.phase === "closed", g = t.phase === "running" || t.phase === "awaiting_user" || t.phase === "cancelling", _ = () => {
		let t = a.trim();
		if (!(!t || h || g)) {
			o(""), u(!0);
			try {
				e.send(t).done.catch(() => {
					o((e) => e || t);
				});
			} catch {
				o(t);
			}
		}
	}, v = a.startsWith("/") && !/\s/.test(a.slice(1)) && !l ? t.commands.filter((e) => e.name.startsWith(a.slice(1).split(/\s/, 1)[0] ?? "")).slice(0, 5) : [], y = Math.min(s, Math.max(0, v.length - 1)), b = (e) => {
		o(`/${e} `), u(!0), f.current?.focus();
	}, x = (e) => {
		if (!e.repeat) {
			if (v.length && e.key === "ArrowDown") {
				e.preventDefault(), c((y + 1) % v.length);
				return;
			}
			if (v.length && e.key === "ArrowUp") {
				e.preventDefault(), c((y - 1 + v.length) % v.length);
				return;
			}
			if (v.length && e.key === "Escape") {
				e.preventDefault(), u(!0);
				return;
			}
			if (e.key === "Enter" && !e.shiftKey && !d.current && !e.nativeEvent.isComposing) {
				e.preventDefault();
				let t = v[y];
				t ? b(t.name) : _();
			}
		}
	}, S = `${i.instance}-commands`;
	return /* @__PURE__ */ Q("footer", {
		className: "paui-composer-wrap",
		"data-pretty-aui-slot": "composer",
		"data-placement": m,
		children: [
			t.contextItems.length ? /* @__PURE__ */ Q("div", {
				className: "paui-context",
				"aria-label": n.context,
				children: t.contextItems.map((e) => /* @__PURE__ */ Q("span", { children: [/* @__PURE__ */ Q(kc, {}), e.label] }, e.id))
			}) : null,
			v.length ? /* @__PURE__ */ Q("div", {
				className: "paui-commands",
				role: "listbox",
				id: S,
				"aria-label": "Commands",
				children: v.map((e, t) => /* @__PURE__ */ Q("button", {
					type: "button",
					id: `${S}-${t}`,
					role: "option",
					"aria-selected": t === y,
					onMouseDown: (e) => e.preventDefault(),
					onClick: () => b(e.name),
					children: [/* @__PURE__ */ Q("code", { children: ["/", e.name] }), /* @__PURE__ */ Q("span", { children: e.description })]
				}, e.name))
			}) : null,
			/* @__PURE__ */ Q("div", {
				className: "paui-composer",
				"data-pretty-aui-slot": "composer-input",
				children: [/* @__PURE__ */ Q("textarea", {
					ref: f,
					rows: 1,
					value: a,
					disabled: h,
					placeholder: n.composerPlaceholder,
					"aria-label": n.composerPlaceholder,
					role: "combobox",
					"aria-autocomplete": "list",
					"aria-haspopup": "listbox",
					"aria-controls": v.length ? S : void 0,
					"aria-expanded": !!v.length,
					"aria-activedescendant": v.length ? `${S}-${y}` : void 0,
					onInput: (e) => {
						o(e.currentTarget.value), c(0), u(!1);
					},
					onCompositionStart: () => {
						d.current = !0;
					},
					onCompositionEnd: () => {
						d.current = !1;
					},
					onKeyDown: x
				}), /* @__PURE__ */ Q("div", {
					className: "paui-composer__actions",
					"data-pretty-aui-slot": "composer-actions",
					children: [t.configOptions.length ? /* @__PURE__ */ Q(zs, {
						controller: e,
						options: t.configOptions
					}) : /* @__PURE__ */ Q("span", {}), g ? /* @__PURE__ */ Q("button", {
						className: "paui-send paui-stop",
						type: "button",
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => r(() => e.cancel()),
						disabled: t.phase === "cancelling",
						children: [/* @__PURE__ */ Q(pc, {}), /* @__PURE__ */ Q("span", {
							className: "paui-sr-only",
							children: n.stop
						})]
					}) : /* @__PURE__ */ Q("button", {
						className: "paui-send",
						type: "button",
						onMouseDown: (e) => e.preventDefault(),
						onClick: _,
						disabled: h || !a.trim(),
						children: [/* @__PURE__ */ Q(fc, {}), /* @__PURE__ */ Q("span", {
							className: "paui-sr-only",
							children: n.send
						})]
					})]
				})]
			})
		]
	});
}
function zs({ controller: e, options: t }) {
	let { runAction: n } = ls("ChatComposer");
	return /* @__PURE__ */ Q("div", {
		className: "paui-config",
		children: t.map((t) => t.type === "boolean" ? /* @__PURE__ */ Q("label", {
			title: t.description,
			children: [/* @__PURE__ */ Q("input", {
				type: "checkbox",
				checked: !!t.currentValue,
				onChange: (r) => n(() => e.setConfigOption(t.id, r.target.checked))
			}), /* @__PURE__ */ Q("span", { children: t.name })]
		}, t.id) : t.type === "select" ? /* @__PURE__ */ Q("label", {
			title: t.description,
			children: [/* @__PURE__ */ Q("span", {
				className: "paui-sr-only",
				children: t.name
			}), /* @__PURE__ */ Q("select", {
				value: String(t.currentValue),
				onChange: (r) => n(() => e.setConfigOption(t.id, r.target.value)),
				children: t.options?.map((e) => /* @__PURE__ */ Q("option", {
					value: e.value,
					children: e.name
				}, e.value))
			})]
		}, t.id) : null)
	});
}
function Bs({ interaction: e, controller: t, labels: n }) {
	let { ids: r } = ls("ChatInteractions"), i = `${r.instance}-${e.id}-title`;
	return /* @__PURE__ */ Q("section", {
		className: "paui-interaction",
		role: "alertdialog",
		"aria-labelledby": i,
		children: [/* @__PURE__ */ Q("div", {
			className: "paui-interaction__icon",
			children: /* @__PURE__ */ Q(Tc, {})
		}), /* @__PURE__ */ Q("div", {
			className: "paui-interaction__content",
			children: [
				/* @__PURE__ */ Q("strong", {
					id: i,
					children: e.title || n.permission
				}),
				e.description ? /* @__PURE__ */ Q("p", { children: e.description }) : null,
				/* @__PURE__ */ Q("div", {
					className: "paui-interaction__actions",
					children: [e.options.map((n, r) => /* @__PURE__ */ Q("button", {
						type: "button",
						className: n.kind.startsWith("reject") ? "paui-button-secondary" : r === 0 ? "paui-button-primary" : "paui-button-secondary",
						onClick: () => t.respondPermission(e.id, {
							outcome: "selected",
							optionId: n.id
						}),
						children: n.name
					}, n.id)), /* @__PURE__ */ Q("button", {
						type: "button",
						className: "paui-button-ghost",
						onClick: () => t.respondPermission(e.id, { outcome: "cancelled" }),
						children: n.cancel
					})]
				})
			]
		})]
	});
}
function Vs({ interaction: e, controller: t, labels: n }) {
	let { ids: r } = ls("ChatInteractions"), i = `${r.instance}-${e.id}-title`;
	if (e.mode === "url" && e.url) {
		let r = $s(e.url);
		return /* @__PURE__ */ Q("section", {
			className: "paui-interaction",
			role: "dialog",
			"aria-labelledby": i,
			children: [/* @__PURE__ */ Q("div", {
				className: "paui-interaction__icon",
				children: /* @__PURE__ */ Q(Ec, {})
			}), /* @__PURE__ */ Q("div", {
				className: "paui-interaction__content",
				children: [
					/* @__PURE__ */ Q("strong", {
						id: i,
						children: e.message
					}),
					/* @__PURE__ */ Q("code", {
						className: "paui-url",
						children: e.url
					}),
					/* @__PURE__ */ Q("div", {
						className: "paui-interaction__actions",
						children: [
							/* @__PURE__ */ Q("button", {
								className: "paui-button-primary",
								type: "button",
								disabled: !r,
								onClick: () => r ? window.open(e.url, "_blank", "noopener,noreferrer") : void 0,
								children: n.openLink
							}),
							/* @__PURE__ */ Q("button", {
								className: "paui-button-secondary",
								type: "button",
								onClick: () => t.respondElicitation(e.id, { action: "accept" }),
								children: n.finish
							}),
							/* @__PURE__ */ Q("button", {
								className: "paui-button-ghost",
								type: "button",
								onClick: () => t.respondElicitation(e.id, { action: "decline" }),
								children: n.decline
							})
						]
					})
				]
			})]
		});
	}
	return /* @__PURE__ */ Q(Hs, {
		interaction: e,
		controller: t,
		labels: n,
		titleId: i
	});
}
function Hs({ interaction: e, controller: t, labels: n, titleId: r }) {
	let i = e.requestedSchema, a = oc(i?.properties) ? i.properties : {}, o = Array.isArray(i?.required) ? i.required.filter((e) => typeof e == "string") : [];
	return /* @__PURE__ */ Q("form", {
		className: "paui-interaction paui-form",
		onSubmit: (n) => {
			n.preventDefault();
			let r = n.currentTarget, i = new FormData(r), o = {};
			for (let [e, t] of Object.entries(a)) if (oc(t)) {
				if (t.type === "boolean") o[e] = i.get(e) === "on";
				else if (t.type === "number" || t.type === "integer") {
					let t = i.get(e);
					if (typeof t != "string" || t.trim() === "") continue;
					let n = Number(t);
					Number.isFinite(n) && (o[e] = n);
				} else o[e] = t.type === "array" ? i.getAll(e).map(String) : String(i.get(e) ?? "");
			}
			t.respondElicitation(e.id, {
				action: "accept",
				content: o
			});
		},
		"aria-labelledby": r,
		children: [/* @__PURE__ */ Q("div", {
			className: "paui-interaction__icon",
			children: /* @__PURE__ */ Q(Mc, {})
		}), /* @__PURE__ */ Q("div", {
			className: "paui-interaction__content",
			children: [
				/* @__PURE__ */ Q("strong", {
					id: r,
					children: e.message
				}),
				/* @__PURE__ */ Q("div", {
					className: "paui-fields",
					children: Object.entries(a).map(([e, t]) => oc(t) ? /* @__PURE__ */ Q(Us, {
						name: e,
						schema: t,
						required: o.includes(e)
					}, e) : null)
				}),
				/* @__PURE__ */ Q("div", {
					className: "paui-interaction__actions",
					children: [/* @__PURE__ */ Q("button", {
						className: "paui-button-primary",
						type: "submit",
						children: n.accept
					}), /* @__PURE__ */ Q("button", {
						className: "paui-button-ghost",
						type: "button",
						onClick: () => t.respondElicitation(e.id, { action: "decline" }),
						children: n.decline
					})]
				})
			]
		})]
	});
}
function Us({ name: e, schema: t, required: n }) {
	let r = typeof t.title == "string" ? t.title : e, i = typeof t.description == "string" ? t.description : void 0, a = Array.isArray(t.enum) ? t.enum.filter((e) => typeof e == "string") : [];
	return t.type === "boolean" ? /* @__PURE__ */ Q("label", {
		className: "paui-field paui-field--check",
		children: [/* @__PURE__ */ Q("input", {
			name: e,
			type: "checkbox"
		}), /* @__PURE__ */ Q("span", { children: r })]
	}) : a.length ? /* @__PURE__ */ Q("label", {
		className: "paui-field",
		children: [
			/* @__PURE__ */ Q("span", { children: r }),
			/* @__PURE__ */ Q("select", {
				name: e,
				required: n,
				children: a.map((e) => /* @__PURE__ */ Q("option", { children: e }, e))
			}),
			i ? /* @__PURE__ */ Q("small", { children: i }) : null
		]
	}) : /* @__PURE__ */ Q("label", {
		className: "paui-field",
		children: [
			/* @__PURE__ */ Q("span", { children: r }),
			/* @__PURE__ */ Q("input", {
				name: e,
				required: n,
				type: t.type === "number" || t.type === "integer" ? "number" : "text"
			}),
			i ? /* @__PURE__ */ Q("small", { children: i }) : null
		]
	});
}
function Ws() {
	let { controller: e, snapshot: t, labels: n, runAction: r } = ls("ChatInteractions");
	return /* @__PURE__ */ Q("section", {
		className: "paui-auth",
		children: [
			/* @__PURE__ */ Q(Tc, {}),
			/* @__PURE__ */ Q("strong", { children: n.authRequired }),
			/* @__PURE__ */ Q("div", { children: t.authMethods.map((t) => /* @__PURE__ */ Q("button", {
				type: "button",
				onClick: () => r(() => e.authenticate(t.id)),
				children: t.name
			}, t.id)) })
		]
	});
}
function Gs({ controller: e, snapshot: t, labels: n, onClose: r }) {
	let { ids: i } = ls("ChatHeader"), a = F(null), o = F(null), [s, c] = Yt(!1), [l, u] = Yt();
	Zt(() => {
		let e = Ks(o.current), t = e instanceof HTMLElement ? e : void 0;
		return a.current?.focus(), () => {
			t?.isConnected && t.focus();
		};
	}, []), Zt(() => {
		t.sessions || (c(!0), e.listSessions().catch((e) => u(e instanceof Error ? e.message : String(e))).finally(() => c(!1)));
	}, [e, t.sessions]), Zt(() => {
		let e = (e) => {
			if (e.key === "Escape") {
				e.preventDefault(), r();
				return;
			}
			if (e.key !== "Tab") return;
			let t = o.current ? [...o.current.querySelectorAll(Js)].filter((e) => !e.hasAttribute("disabled")) : [], n = t[0], i = t.at(-1);
			if (!n || !i) return;
			let a = Ks(o.current);
			e.shiftKey && a === n ? (e.preventDefault(), i.focus()) : (!e.shiftKey && a === i || !a || !o.current?.contains(a)) && (e.preventDefault(), n.focus());
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [r]);
	let d = async (t) => {
		c(!0), u(void 0);
		try {
			await e.openSession(t), r();
		} catch (e) {
			u(e instanceof Error ? e.message : String(e));
		} finally {
			c(!1);
		}
	}, f = async (t) => {
		c(!0), u(void 0);
		try {
			await e.listSessions(t);
		} catch (e) {
			u(e instanceof Error ? e.message : String(e));
		} finally {
			c(!1);
		}
	};
	return /* @__PURE__ */ Q("div", {
		className: "paui-drawer-backdrop",
		role: "presentation",
		onMouseDown: (e) => {
			e.target === e.currentTarget && r();
		},
		children: /* @__PURE__ */ Q("aside", {
			ref: o,
			className: "paui-drawer",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": i.sessionsTitle,
			children: [/* @__PURE__ */ Q("header", { children: [/* @__PURE__ */ Q("strong", {
				id: i.sessionsTitle,
				children: n.sessions
			}), /* @__PURE__ */ Q("button", {
				ref: a,
				className: "paui-icon-button",
				type: "button",
				onClick: r,
				children: [/* @__PURE__ */ Q(uc, {}), /* @__PURE__ */ Q("span", {
					className: "paui-sr-only",
					children: n.close
				})]
			})] }), /* @__PURE__ */ Q("div", {
				className: "paui-session-list",
				children: [
					s && !t.sessions ? /* @__PURE__ */ Q("span", {
						className: "paui-muted",
						children: "…"
					}) : null,
					!s && !t.sessions?.sessions.length ? /* @__PURE__ */ Q("span", {
						className: "paui-muted",
						children: n.noSessions
					}) : null,
					t.sessions?.sessions.map((r) => /* @__PURE__ */ Q("div", {
						className: "paui-session",
						"data-active": r.sessionId === t.sessionId || void 0,
						children: [/* @__PURE__ */ Q("button", {
							type: "button",
							disabled: s || r.sessionId === t.sessionId,
							onClick: () => void d(r.sessionId),
							children: [/* @__PURE__ */ Q("strong", { children: r.title ?? n.sessionUntitled }), /* @__PURE__ */ Q("span", { children: ic(r.updatedAt) })]
						}), t.capabilities.deleteSession && r.sessionId !== t.sessionId ? /* @__PURE__ */ Q("button", {
							className: "paui-icon-button",
							type: "button",
							title: n.deleteSession,
							onClick: () => {
								window.confirm(n.confirmDeleteSession(r.title ?? n.sessionUntitled)) && e.deleteSession(r.sessionId).catch((e) => u(e instanceof Error ? e.message : String(e)));
							},
							children: [/* @__PURE__ */ Q(dc, {}), /* @__PURE__ */ Q("span", {
								className: "paui-sr-only",
								children: n.deleteSession
							})]
						}) : null]
					}, r.sessionId)),
					t.sessions?.nextCursor ? /* @__PURE__ */ Q("button", {
						className: "paui-load-more",
						type: "button",
						disabled: s,
						onClick: () => void f(t.sessions?.nextCursor),
						children: n.loadMore
					}) : null,
					l ? /* @__PURE__ */ Q("span", {
						className: "paui-error-text",
						role: "alert",
						children: l
					}) : null
				]
			})]
		})
	});
}
function Ks(e) {
	let t = e?.getRootNode();
	return t instanceof Document || t instanceof ShadowRoot ? t.activeElement : document.activeElement;
}
var qs = new Qo({
	gfm: !0,
	breaks: !0
}), Js = "a[href], button, input, select, textarea, [tabindex]:not([tabindex=\"-1\"])", Ys = new Jo();
Ys.html = ({ text: e }) => Qs(e), Ys.image = ({ text: e }) => `<span class="paui-markdown-image-alt">${Qs(e)}</span>`, Ys.checkbox = ({ checked: e }) => e ? "[x] " : "[ ] ", Ys.link = ({ href: e, title: t, tokens: n }) => {
	let r = Qs(n.map((e) => e.raw).join(""));
	return $s(e) ? `<a href="${Zs(e)}" target="_blank" rel="noopener noreferrer"${t ? ` title="${Zs(t)}"` : ""}>${r}</a>` : r;
}, qs.use({ renderer: Ys });
function Xs(e) {
	let t = qs.parse(e);
	return ga.sanitize(t, {
		USE_PROFILES: { html: !0 },
		ADD_ATTR: ["target", "rel"],
		FORBID_TAGS: [
			"style",
			"form",
			"input",
			"button",
			"textarea",
			"select",
			"option"
		],
		FORBID_ATTR: ["style"]
	});
}
function Zs(e) {
	return Qs(e).replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
function Qs(e) {
	return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function $s(e) {
	try {
		let t = new URL(e, globalThis.location?.href ?? "https://example.invalid");
		return [
			"http:",
			"https:",
			"mailto:"
		].includes(t.protocol);
	} catch {
		return !1;
	}
}
function ec(e) {
	let t = as.get(e);
	if (t !== void 0) return t;
	let n = ++os;
	return as.set(e, n), n;
}
function tc(e, t) {
	if (typeof globalThis.requestAnimationFrame != "function") return e.subscribe(t);
	let n, r = e.getSnapshot(), i = e.subscribe(() => {
		let i = e.getSnapshot(), a = r.phase === "running" && i.phase === "running";
		if (r = i, !a) {
			n !== void 0 && (typeof globalThis.cancelAnimationFrame == "function" && globalThis.cancelAnimationFrame(n), n = void 0), t();
			return;
		}
		n === void 0 && (n = globalThis.requestAnimationFrame(() => {
			n = void 0, t();
		}));
	});
	return () => {
		i(), n !== void 0 && typeof globalThis.cancelAnimationFrame == "function" && globalThis.cancelAnimationFrame(n);
	};
}
function nc(e) {
	return e.some((e) => e.status === "in_progress") ? "in_progress" : e.length && e.every((e) => e.status === "completed") ? "completed" : "pending";
}
function rc(e) {
	switch (e.type) {
		case "tool": return e.status;
		case "plan": return nc(e.entries);
		case "terminal": return e.exited ? "completed" : "in_progress";
		case "message": return e.pending ? "pending" : void 0;
		case "unsupported": return "unsupported";
	}
}
function ic(e) {
	if (!e) return "";
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? e : ac.format(t);
}
var ac = new Intl.DateTimeFormat(void 0, {
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit"
});
function oc(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function sc({ status: e }) {
	return /* @__PURE__ */ Q("span", {
		className: "paui-status",
		"data-status": e,
		children: e.replaceAll("_", " ")
	});
}
function $({ children: e }) {
	return /* @__PURE__ */ Q("svg", {
		viewBox: "0 0 20 20",
		"aria-hidden": "true",
		focusable: "false",
		children: e
	});
}
var cc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M3 10a7 7 0 1 0 2-4.9M3 3v4h4M10 6v4l3 2" }) }), lc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M4 4h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H8l-4 3v-3a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3M10 7v5M7.5 9.5h5" }) }), uc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "m5 5 10 10M15 5 5 15" }) }), dc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M4 6h12M8 3h4l1 3M6 6l1 11h6l1-11M9 9v5M12 9v5" }) }), fc = () => /* @__PURE__ */ Q("svg", {
	viewBox: "0 0 16 16",
	"aria-hidden": "true",
	focusable: "false",
	children: /* @__PURE__ */ Q("path", {
		d: "M8.3125.9802c.3552.0729.6665.224 0.9502.4521.2245.1807.4676.4256.7168.6748L14.707 6.8347 13.293 8.2487 9 3.9558v11.0859H7V3.9558L2.707 8.2487 1.293 6.8347l4.7275-4.7276c.2492-.2492.4923-.4941.7168-.6748.2393-.1924.5471-.3883.9502-.4521.2098-.0332.4156-.025.625 0Z",
		fill: "currentColor"
	})
}), pc = () => /* @__PURE__ */ Q("svg", {
	viewBox: "0 0 16 16",
	"aria-hidden": "true",
	focusable: "false",
	children: /* @__PURE__ */ Q("rect", {
		x: "3",
		y: "3",
		width: "10",
		height: "10",
		rx: "3",
		fill: "currentColor"
	})
}), mc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "m5 8 5 5 5-5" }) }), hc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "m12.5 4.5-5 5 5 5" }) }), gc = () => /* @__PURE__ */ Q("svg", {
	viewBox: "0 0 14 14",
	"aria-hidden": "true",
	focusable: "false",
	children: /* @__PURE__ */ Q("path", { d: "m4 5.5 3 3 3-3" })
}), _c = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M12.5 4.2a4 4 0 0 0-5 5L3 13.7 6.3 17l4.5-4.5a4 4 0 0 0 5-5l-2.3 2.3-3.3-3.3 2.3-2.3Z" }) }), vc = () => /* @__PURE__ */ Q($, { children: [
	/* @__PURE__ */ Q("circle", {
		cx: "10",
		cy: "5",
		r: "2"
	}),
	/* @__PURE__ */ Q("circle", {
		cx: "5",
		cy: "14",
		r: "2"
	}),
	/* @__PURE__ */ Q("circle", {
		cx: "15",
		cy: "14",
		r: "2"
	}),
	/* @__PURE__ */ Q("path", { d: "m8.8 6.7-2.6 5.6M11.2 6.7l2.6 5.6M7 14h6" })
] }), yc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M5 5h5v5M10 5 4.5 10.5M9 9h6v6H9" }) }), bc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M6 5h10M6 10h10M6 15h10M3 5h.01M3 10h.01M3 15h.01" }) }), xc = () => /* @__PURE__ */ Q("svg", {
	className: "paui-think-icon",
	viewBox: "0 0 14 14",
	"aria-hidden": "true",
	focusable: "false",
	children: [/* @__PURE__ */ Q("path", {
		d: "M7.06431 5.93342C7.68763 5.93342 8.19307 6.43904 8.19322 7.06233C8.19322 7.68573 7.68772 8.19123 7.06431 8.19123C6.44099 8.19113 5.9354 7.68567 5.9354 7.06233C5.93555 6.43911 6.44108 5.93353 7.06431 5.93342Z",
		fill: "currentColor"
	}), /* @__PURE__ */ Q("path", {
		fillRule: "evenodd",
		clipRule: "evenodd",
		d: "M8.6815.963693c1.4354-.516674 2.9451-.588864 3.8818.347657.9367.9367.8644 2.44641.3477 3.88184-.1984.55112-.4724 1.12477-.8145 1.7041.4004.64909.7176 1.29289.9395 1.90918.5167 1.43543.5891 2.94513-.3477 3.88183-.9367.9367-2.4463.8644-3.8818.3477-.61628-.2219-1.26009-.5391-1.90918-.9395-.57935.3421-1.15297.616-1.7041.8145-1.43545.5166-2.94512.589-3.88184-.3477-.936521-.9367-.864331-2.4465-.347656-3.88188.208126-.57809.499486-1.18084.865236-1.78907-.30714-.53529-.55661-1.06415-.74024-1.57421C.572068 3.88278.499714 2.37306 1.43638 1.43635c.9367-.936695 2.44642-.864306 3.88184-.34766.51006.18363 1.03893.43311 1.57421.74024.60823-.36575 1.21098-.65712 1.78907-.865237ZM11.3573 8.01154c-.449.61099-.9672 1.21719-1.54787 1.79786-.58066.5807-1.18688 1.0989-1.79785 1.5478.41412.2269.81712.4115 1.20117.5499 1.33285.4797 2.21185.3476 2.62695-.0674.4151-.4151.5472-1.2941.0674-2.62698-.1383-.38406-.323-.78704-.5498-1.20118ZM2.56529 8.02912c-.19185.3641-.35034.71884-.47266 1.0586-.47972 1.33268-.34751 2.21178.06738 2.62698.41504.415 1.29414.5471 2.62696.0674.3236-.1165.66089-.2657 1.00683-.4454-.5448-.4144-1.08458-.8834-1.60351-1.4023-.61451-.61453-1.1586-1.25807-1.625-1.90528Zm4.34179-4.78222c-.66643.45789-1.34248 1.01631-1.99316 1.66699-.65067.65067-1.2091 1.32674-1.66699 1.99316.47981.7262 1.08084 1.46754 1.79199 2.17871.61051.61051 1.24291 1.14074 1.86914 1.58204.68562-.4653 1.38274-1.03704 2.05273-1.70704.67001-.67001 1.24171-1.3671 1.70701-2.05273-.4413-.62623-.97149-1.25863-1.58201-1.86914-.71117-.71116-1.45251-1.31217-2.17871-1.79199Zm4.80762-1.08692c-.4151-.41489-1.2943-.5471-2.62695-.06738-.3394.12219-.69393.28011-1.05762.47168.64715.46637 1.28982 1.01152 1.9043 1.62598.51897.51894.98787 1.0587 1.40237 1.60351.1796-.34592.3288-.68325.4453-1.00683.4797-1.33278.3476-2.21192-.0674-2.62696ZM4.91197 2.2176c-1.33275-.47972-2.21193-.34765-2.62696.06738-.415.41505-.5471 1.29422-.06738 2.62696.09946.27628.22349.56233.36914.85546.43254-.5787.92797-1.1516 1.47852-1.70214.55055-.55056 1.12343-1.04598 1.70214-1.47852-.29312-.14564-.57919-.26968-.85546-.36914Z",
		fill: "currentColor"
	})]
}), Sc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M5 3h10v14H5zM8 7h4M8 10h4" }) }), Cc = () => /* @__PURE__ */ Q($, { children: [/* @__PURE__ */ Q("circle", {
	cx: "8.5",
	cy: "8.5",
	r: "5.5"
}), /* @__PURE__ */ Q("path", { d: "m12.5 12.5 4 4" })] }), wc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "m4 6 4 4-4 4M10 14h6" }) }), Tc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M10 2 16 5v5c0 4-2.5 6.5-6 8-3.5-1.5-6-4-6-8V5l6-3Zm-2 8 1.5 1.5L13 8" }) }), Ec = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M8 12 12 8M6.5 13.5l-1 1a3 3 0 0 1-4-4l3-3a3 3 0 0 1 4 0M13.5 6.5l1-1a3 3 0 0 1 4 4l-3 3a3 3 0 0 1-4 0" }) }), Dc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M5 2h7l4 4v12H5V2Zm7 0v5h4" }) }), Oc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M5 3v14M3 5l2-2 2 2M15 17V3M13 15l2 2 2-2M9 7h3M9 13h3" }) }), kc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M6 5h10v10H6zM3 8v9h9" }) }), Ac = () => /* @__PURE__ */ Q($, { children: [/* @__PURE__ */ Q("circle", {
	cx: "10",
	cy: "10",
	r: "7"
}), /* @__PURE__ */ Q("path", { d: "M10 9v5M10 6h.01" })] }), jc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "m10 2 1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2ZM15.5 13l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" }) }), Mc = () => /* @__PURE__ */ Q($, { children: /* @__PURE__ */ Q("path", { d: "M4 3h12v14H4zM7 7h6M7 10h6M7 13h3" }) }), Nc = ".pretty-aui{--paui-default-background:#fff;--paui-default-surface:#f7f8fa;--paui-default-surface-raised:#fff;--paui-default-user-bubble:#edf3fe;--paui-default-text:#0f1115;--paui-default-text-muted:#667085;--paui-default-border:#e5e7eb;--paui-default-accent:#4176e6;--paui-default-on-accent:#fff;--paui-default-accent-soft:#edf3fe;--paui-default-danger:#c63d4f;--paui-default-warning:#a86610;--paui-default-success:#24845b;--paui-default-action-hover:#679efe;--paui-default-flow-title:#61666b;--paui-default-flow-copy:#81858c;--paui-default-flow-caption:#adb2b8;--paui-background:var(--pretty-aui-color-background,var(--paui-default-background));--paui-surface:var(--pretty-aui-color-surface,var(--paui-default-surface));--paui-surface-raised:var(--pretty-aui-color-surface-raised,var(--paui-default-surface-raised));--paui-user-bubble:var(--pretty-aui-color-user-bubble,var(--paui-default-user-bubble));--paui-text:var(--pretty-aui-color-text,var(--paui-default-text));--paui-text-muted:var(--pretty-aui-color-text-muted,var(--paui-default-text-muted));--paui-border:var(--pretty-aui-color-border,var(--paui-default-border));--paui-accent:var(--pretty-aui-color-accent,var(--paui-default-accent));--paui-on-accent:var(--pretty-aui-color-on-accent,var(--paui-default-on-accent));--paui-accent-soft:var(--pretty-aui-color-accent-soft,var(--paui-default-accent-soft));--paui-danger:var(--pretty-aui-color-danger,var(--paui-default-danger));--paui-warning:var(--pretty-aui-color-warning,var(--paui-default-warning));--paui-success:var(--pretty-aui-color-success,var(--paui-default-success));--paui-action-hover:var(--paui-default-action-hover);--paui-flow-title:var(--pretty-aui-color-text-muted,var(--paui-default-flow-title));--paui-flow-copy:var(--pretty-aui-color-text-muted,var(--paui-default-flow-copy));--paui-flow-caption:var(--pretty-aui-color-text-muted,var(--paui-default-flow-caption));--paui-sans:var(--pretty-aui-font-sans,Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif);--paui-mono:var(--pretty-aui-font-mono,ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);--paui-shadow-raised:var(--pretty-aui-shadow-raised,0 4px 12px 0 #00000005, 0 2px 8px 0 #0000000a);--paui-content-width:var(--pretty-aui-content-max-width,748px);--paui-composer-width:var(--pretty-aui-composer-max-width,780px);--paui-gutter:var(--pretty-aui-gutter,16px);box-sizing:border-box;width:100%;height:var(--pretty-aui-height,680px);border:1px solid var(--paui-border);min-width:0;min-height:420px;color:var(--paui-text);--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;background:var(--paui-background);contain:layout style;font-family:var(--paui-sans);text-align:left;isolation:isolate;border-radius:14px;grid-template-rows:auto minmax(0,1fr) auto auto;font-size:14px;line-height:1.5;display:grid;position:relative;overflow:clip;container:pretty-aui/inline-size}.pretty-aui[data-scheme=dark]{--paui-default-background:#151517;--paui-default-surface:#232324;--paui-default-surface-raised:#2c2c2e;--paui-default-user-bubble:#2c2c2e;--paui-default-text:#f9fafb;--paui-default-text-muted:#a4a7ae;--paui-default-border:#343438;--paui-default-accent:#679efe;--paui-default-on-accent:#0f1115;--paui-default-accent-soft:#202c43;--paui-default-danger:#f08a96;--paui-default-warning:#e6ab5e;--paui-default-success:#65c99c;--paui-default-action-hover:#8ab4ff;--paui-default-flow-title:#cfd3d6;--paui-default-flow-copy:#adb2b8;--paui-default-flow-caption:#81858c;--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}@media (prefers-color-scheme:dark){.pretty-aui[data-scheme=system]{--paui-default-background:#151517;--paui-default-surface:#232324;--paui-default-surface-raised:#2c2c2e;--paui-default-user-bubble:#2c2c2e;--paui-default-text:#f9fafb;--paui-default-text-muted:#a4a7ae;--paui-default-border:#343438;--paui-default-accent:#679efe;--paui-default-on-accent:#0f1115;--paui-default-accent-soft:#202c43;--paui-default-danger:#f08a96;--paui-default-warning:#e6ab5e;--paui-default-success:#65c99c;--paui-default-action-hover:#8ab4ff;--paui-default-flow-title:#cfd3d6;--paui-default-flow-copy:#adb2b8;--paui-default-flow-caption:#81858c;--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark}}.pretty-aui *,.pretty-aui :before,.pretty-aui :after{box-sizing:border-box}.pretty-aui button,.pretty-aui input,.pretty-aui select,.pretty-aui textarea{color:inherit;font:inherit}.pretty-aui button{cursor:pointer}.pretty-aui :is(button,input,select,textarea):disabled{cursor:not-allowed;opacity:.46}.pretty-aui :is(button,input,select,textarea,summary,a,.paui-body):focus-visible{outline:2px solid var(--paui-accent);outline-offset:2px}.pretty-aui svg{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.6px;flex:none;width:18px;height:18px}.paui-header{z-index:4;border-bottom:1px solid var(--paui-border);background:color-mix(in srgb, var(--paui-background) 94%, transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);justify-content:space-between;align-items:center;min-width:0;min-height:56px;padding:10px 14px 10px 18px;display:flex}.pretty-aui[data-surface=sidebar] .paui-header{min-height:48px;padding:7px 8px 7px 12px}.paui-identity,.paui-header__actions,.paui-interaction__actions,.paui-config,.paui-context{align-items:center;display:flex}.paui-identity{flex:auto;gap:10px;min-width:0}.paui-identity>div{min-width:0;display:grid}.paui-identity strong{letter-spacing:-.01em;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600;overflow:hidden}.paui-lineage{min-width:0;display:grid}.paui-lineage__titles{white-space:nowrap;align-items:center;gap:6px;min-width:0;display:flex}.paui-lineage__titles strong{text-overflow:ellipsis;min-width:0;overflow:hidden}.paui-lineage__ancestor{min-width:0;color:var(--paui-flow-caption);align-items:center;gap:6px;display:inline-flex}.paui-lineage__ancestor button{max-width:144px;color:var(--paui-text-muted);text-overflow:ellipsis;white-space:nowrap;background:0 0;border:0;padding:0;font-size:13px;overflow:hidden}.paui-lineage__ancestor button:hover:not(:disabled){color:var(--paui-text)}.paui-lineage__back{background:0 0;border:0;border-radius:7px;place-items:center;width:28px;height:28px;padding:0;display:none}.paui-lineage__back:hover:not(:disabled){background:var(--paui-surface)}.paui-lineage__back svg{width:16px;height:16px}.paui-protocol{color:var(--paui-text-muted);font-family:var(--paui-mono);letter-spacing:.02em;text-overflow:ellipsis;text-transform:uppercase;white-space:nowrap;font-size:10px;overflow:hidden}.pretty-aui[data-surface=sidebar] .paui-protocol{display:none}.paui-presence{border:2px solid var(--paui-background);background:var(--paui-text-muted);width:9px;height:9px;box-shadow:0 0 0 1px var(--paui-border);border-radius:50%;flex:none}.paui-presence[data-phase=idle]{background:var(--paui-success)}.paui-presence:is([data-phase=running],[data-phase=awaiting_user],[data-phase=cancelling]){background:var(--paui-accent);box-shadow:0 0 0 1px var(--paui-accent), 0 0 0 4px var(--paui-accent-soft)}.paui-header__actions{flex:none;gap:2px}.paui-icon-button,.paui-send,.paui-to-bottom{background:0 0;border:0;border-radius:10px;place-items:center;width:34px;height:34px;padding:0;display:inline-grid}.paui-icon-button:hover:not(:disabled){background:var(--paui-surface)}.paui-body{min-width:0;padding:24px var(--paui-gutter) 132px;overscroll-behavior:contain;scrollbar-color:var(--paui-border) transparent;scrollbar-gutter:stable;position:relative;overflow:hidden auto}.paui-transcript{width:100%;max-width:var(--paui-content-width);gap:28px;margin:0 auto;display:grid}.paui-turn{gap:16px;min-width:0;display:grid}.paui-message{min-width:0}.paui-message[data-role=user]{background:var(--paui-user-bubble);border-radius:22px;max-width:min(525px,82%);margin-left:auto;padding:10px 16px}.paui-message[data-role=user][data-pending=true]{opacity:.68}.paui-message__label{display:none}.paui-message__content>:first-child,.paui-markdown>:first-child{margin-top:0}.paui-message__content>:last-child,.paui-markdown>:last-child{margin-bottom:0}.paui-markdown{overflow-wrap:anywhere;min-width:0;font-size:16px;line-height:28px}.paui-message[data-role=user] .paui-markdown{font-size:16px;line-height:24px}.paui-markdown :is(p,ul,ol,pre,blockquote){margin:.72em 0}.paui-markdown :is(h1,h2,h3,h4){letter-spacing:-.015em;margin:1.15em 0 .45em;font-size:1em;font-weight:650}.paui-markdown :is(code),.paui-url,.paui-terminal pre,.paui-diff pre,.paui-resource pre{font-family:var(--paui-mono);font-size:.84em}.paui-markdown :not(pre)>code{background:var(--paui-surface);border-radius:5px;padding:.14em .35em}.paui-markdown pre,.paui-terminal pre,.paui-diff pre,.paui-resource pre{border:1px solid var(--paui-border);background:var(--paui-surface);white-space:pre;border-radius:9px;max-width:100%;padding:12px 14px;line-height:1.55;overflow:auto}.paui-markdown a,.paui-resource{color:var(--paui-accent);-webkit-text-decoration-color:color-mix(in srgb, var(--paui-accent) 45%, transparent);text-decoration-color:color-mix(in srgb, var(--paui-accent) 45%, transparent);text-underline-offset:3px}.paui-activities{gap:16px;min-width:0;display:grid}.paui-activity,.paui-thought,.paui-disclosure,.paui-diff,.paui-resource{min-width:0}.paui-thought>summary,.paui-disclosure>summary,.paui-diff>summary,.paui-resource>summary{min-height:28px;color:var(--paui-text-muted);cursor:pointer;border-radius:6px;align-items:center;gap:7px;font-size:13px;line-height:20px;list-style:none;display:flex}.paui-thought>summary:hover,.paui-disclosure>summary:hover{color:color-mix(in srgb, var(--paui-text) 78%, var(--paui-text-muted))}.pretty-aui summary::-webkit-details-marker{display:none}.paui-thought>summary svg,.paui-disclosure>summary svg,.paui-diff>summary svg,.paui-resource>summary svg{width:15px;height:15px}.paui-thought__body,.paui-disclosure__body{color:var(--paui-text-muted);padding:4px 0 4px 22px;font-size:14px;line-height:24px}.pretty-aui .paui-flow-summary{align-items:center;gap:0;min-width:0;height:24px;min-height:24px;line-height:24px;display:flex;position:relative;overflow:hidden}.paui-flow-leading{width:16px;height:16px;color:var(--paui-flow-copy);flex:none;justify-content:center;align-items:center;margin-right:6px;display:inline-flex;position:relative}.paui-flow-icon,.paui-flow-chevron{justify-content:center;align-items:center;transition:opacity .1s;display:inline-flex}.paui-flow-chevron{opacity:0;position:absolute;inset:0}.pretty-aui .paui-flow-leading svg{width:14px;height:14px}.pretty-aui .paui-flow-leading .paui-think-icon{fill:currentColor;stroke:none}.paui-flow-summary:hover .paui-flow-icon,.paui-thought[open] .paui-flow-icon,.paui-tool[open] .paui-flow-icon{opacity:0}.paui-flow-summary:hover .paui-flow-chevron,.paui-thought[open] .paui-flow-chevron,.paui-tool[open] .paui-flow-chevron{opacity:1}.paui-flow-title{color:var(--paui-flow-title);flex:none;font-size:14px;font-weight:400;line-height:24px}.paui-flow-separator{background:var(--paui-flow-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}.paui-flow-preview{min-width:0;color:var(--paui-flow-copy);text-overflow:ellipsis;white-space:nowrap;flex:auto;font-size:14px;line-height:24px;overflow:hidden}.paui-flow-preview[data-follow-end=true]{text-overflow:clip}.paui-subagent-row{align-items:flex-start;gap:4px;width:100%;min-width:0;min-height:24px;display:flex}.paui-subagent{flex:auto;min-width:0}.paui-subagent-status{color:var(--paui-flow-caption);white-space:nowrap;flex:none;align-items:center;gap:8px;margin-left:12px;font-size:11px;line-height:24px;display:inline-flex}.paui-subagent-status__ongoing{align-items:center;gap:5px;display:inline-flex}.paui-subagent-status__spinner{border:1.5px solid color-mix(in srgb, var(--paui-accent) 28%, transparent);border-top-color:var(--paui-accent);border-radius:50%;width:9px;height:9px;animation:.8s linear infinite paui-subagent-spin}.paui-subagent-status[data-status=failed],.paui-subagent-status[data-status=cancelled],.paui-subagent:is([data-state=failed],[data-state=cancelled]) .paui-flow-leading{color:var(--paui-danger)}.paui-subagent-open{width:24px;height:24px;color:var(--paui-flow-copy);background:0 0;border:0;border-radius:6px;flex:none;place-items:center;padding:0;display:inline-grid}.paui-subagent-open:hover:not(:disabled){color:var(--paui-text);background:var(--paui-surface)}.paui-subagent-open svg{width:14px;height:14px}.paui-subagent[open] .paui-flow-icon{opacity:0}.paui-subagent[open] .paui-flow-chevron{opacity:1}@keyframes paui-subagent-spin{to{transform:rotate(360deg)}}.paui-thought[open] .paui-flow-separator,.paui-thought[open] .paui-flow-preview{display:none}.paui-tool[data-state=failed] .paui-flow-leading{color:var(--paui-danger)}.paui-thought[data-running=true]>.paui-flow-summary:after,.paui-tool:is([data-state=pending],[data-state=in_progress])>.paui-flow-summary:after{inset-block:0;background:linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--paui-background) 60%, transparent) 55%, transparent 100%);content:\"\";pointer-events:none;width:300px;animation:2.6s ease-out infinite paui-flow-sweep;position:absolute;left:0}@keyframes paui-flow-sweep{0%{left:-300px}90%,to{left:100%}}@media (prefers-reduced-motion:reduce){.paui-thought[data-running=true]>.paui-flow-summary:after,.paui-tool:is([data-state=pending],[data-state=in_progress])>.paui-flow-summary:after{animation:none}.paui-subagent-status__spinner{border-color:var(--paui-accent);background:var(--paui-accent);animation:none}}.paui-status{color:var(--paui-text-muted);font-family:var(--paui-mono);letter-spacing:.04em;text-transform:uppercase;margin-left:auto;font-size:9px}.paui-status:is([data-status=failed],[data-status=cancelled]){color:var(--paui-danger)}.paui-plan__list{gap:6px;margin:4px 0 0;padding:4px 0 4px 22px;list-style:none;display:grid}.paui-plan__list li{color:var(--paui-text-muted);grid-template-columns:12px 1fr;align-items:start;gap:8px;font-size:13px;line-height:20px;display:grid}.paui-plan__mark{border:1px solid;border-radius:50%;width:7px;height:7px;margin-top:6px}.paui-plan__list li[data-status=completed] .paui-plan__mark{border-color:var(--paui-success);background:var(--paui-success)}.paui-plan__list li[data-status=in_progress]{color:var(--paui-text)}.paui-plan__list li[data-status=in_progress] .paui-plan__mark{border-color:var(--paui-accent);background:var(--paui-accent);box-shadow:inset 0 0 0 2px var(--paui-background)}.paui-media{border-radius:10px;max-width:100%;max-height:420px;margin:10px 0;display:block}.paui-resource{align-items:center;gap:6px;display:inline-flex}.paui-resource svg{width:15px;height:15px}.paui-unsupported,.paui-muted{color:var(--paui-text-muted);font-size:12px}.paui-notice{background:var(--paui-accent-soft);border-radius:9px;align-items:center;gap:10px;padding:10px 12px;display:flex}.paui-notice>div,.paui-error>div{flex:1;min-width:0;display:grid}.paui-notice strong,.paui-error strong{font-size:12px}.paui-notice span,.paui-error span{color:var(--paui-text-muted);font-size:11px}.paui-notice svg,.paui-error svg{width:16px}.paui-empty{max-width:340px;color:var(--paui-text-muted);text-align:center;justify-items:center;margin:clamp(42px,12vh,90px) auto;display:grid}.paui-empty svg{width:24px;height:24px;color:var(--paui-accent);margin-bottom:12px}.paui-empty strong{color:var(--paui-text);letter-spacing:-.01em;font-size:16px;font-weight:600}.paui-empty p{margin:5px 0 0;font-size:12px}.paui-interactions{z-index:3;min-width:0;padding:0 var(--paui-gutter);background:var(--paui-background);gap:8px;display:grid}.paui-interactions:empty{display:none}.paui-error,.paui-interaction,.paui-auth{width:100%;max-width:var(--paui-content-width);border:1px solid var(--paui-border);background:var(--paui-surface);border-radius:12px;gap:11px;margin:0 auto;display:flex}.paui-error{border-color:color-mix(in srgb, var(--paui-danger) 30%, var(--paui-border));align-items:center;padding:10px 12px}.paui-error button,.paui-auth button,.paui-load-more{border:1px solid var(--paui-border);background:var(--paui-background);border-radius:8px;padding:6px 10px;font-size:12px}.paui-interaction{padding:14px}.paui-interaction__icon{width:28px;height:28px;color:var(--paui-accent);background:var(--paui-accent-soft);border-radius:8px;flex:none;place-items:center;display:grid}.paui-interaction__icon svg{width:16px}.paui-interaction__content{flex:1;gap:8px;min-width:0;display:grid}.paui-interaction__content>strong{font-size:13px}.paui-interaction__content>p{color:var(--paui-text-muted);margin:-3px 0 0;font-size:12px}.paui-interaction__actions{flex-wrap:wrap;gap:6px}.paui-button-primary,.paui-button-secondary,.paui-button-ghost{border-radius:8px;min-height:30px;padding:5px 10px;font-size:12px}.paui-button-primary{border:1px solid var(--paui-accent);color:var(--paui-on-accent);background:var(--paui-accent)}.paui-button-secondary{border:1px solid var(--paui-border);background:var(--paui-background)}.paui-button-ghost{color:var(--paui-text-muted);background:0 0;border:1px solid #0000}.paui-url{border:1px solid var(--paui-border);background:var(--paui-background);text-overflow:ellipsis;white-space:nowrap;border-radius:7px;padding:7px 8px;overflow:hidden}.paui-fields{gap:10px;display:grid}.paui-field{color:var(--paui-text-muted);gap:4px;font-size:11px;display:grid}.paui-field input,.paui-field select{border:1px solid var(--paui-border);min-height:34px;color:var(--paui-text);background:var(--paui-background);border-radius:7px;padding:6px 8px}.paui-field small{font-size:10px}.paui-field--check{align-items:center;display:flex}.paui-auth{justify-items:start;padding:16px;display:grid}.paui-auth>div{gap:6px;display:flex}.paui-auth>svg{color:var(--paui-accent)}.paui-composer-wrap{z-index:3;width:100%;padding:36px var(--paui-gutter) 8px;background:linear-gradient(to bottom, color-mix(in srgb, var(--paui-background) 0%, transparent) 0, var(--paui-background) 36px);justify-items:center;gap:6px;display:grid}.paui-composer-wrap[data-placement=hero]{transition:top .18s,transform .18s;position:absolute;top:50%;left:0;transform:translateY(-10%)}.paui-composer,.paui-context{width:100%;max-width:var(--paui-composer-width)}.paui-composer{border:1px solid var(--paui-border);background:var(--paui-surface-raised);box-shadow:var(--paui-shadow-raised);border-radius:22px;flex-direction:column;gap:12px;padding:10px 8px 6px 16px;font-size:16px;line-height:24px;transition:border-color .12s,box-shadow .12s;display:flex;position:relative}.paui-composer:focus-within{border-color:color-mix(in srgb, var(--paui-accent) 55%, var(--paui-border))}.paui-composer textarea{resize:none;background:0 0;border:0;outline:0;width:100%;min-height:24px;max-height:336px;padding:2px 0;line-height:24px;overflow-y:auto}.pretty-aui .paui-composer textarea:focus-visible{outline:0}.paui-composer-wrap[data-placement=hero] .paui-composer textarea{min-height:52px}.paui-composer textarea::placeholder{color:var(--paui-text-muted)}.paui-composer__actions{justify-content:space-between;align-items:center;width:100%;min-width:0;display:flex}.pretty-aui .paui-send{color:var(--paui-on-accent);background:var(--paui-accent);border-radius:999px;transition:background-color .1s;transform:translateY(-2px)}.pretty-aui .paui-send:hover:not(:disabled){background:var(--paui-action-hover)}.pretty-aui .paui-send:disabled{opacity:.4}.pretty-aui .paui-send svg{stroke:none;width:16px;height:16px}.pretty-aui .paui-stop{color:#fff;background:var(--paui-accent)}.paui-context{scrollbar-width:none;gap:5px;overflow-x:auto}.paui-context>span{border:1px solid var(--paui-border);color:var(--paui-text-muted);background:var(--paui-background);border-radius:999px;flex:none;align-items:center;gap:4px;padding:3px 7px;font-size:10px;display:inline-flex}.paui-context svg{width:12px;height:12px}.paui-config{width:auto;min-height:20px;color:var(--paui-text-muted);gap:8px;font-size:10px}.paui-config label{align-items:center;gap:4px;display:inline-flex}.paui-config select{max-width:150px;color:var(--paui-text-muted);background:0 0;border:0;font-size:10px}.paui-commands{right:var(--paui-gutter);bottom:76px;left:var(--paui-gutter);max-width:var(--paui-composer-width);border:1px solid var(--paui-border);background:var(--paui-surface-raised);box-shadow:var(--paui-shadow-raised);border-radius:12px;margin:0 auto;display:grid;position:absolute;overflow:hidden}.paui-commands button{border:0;border-bottom:1px solid var(--paui-border);text-align:left;background:0 0;grid-template-columns:minmax(110px,auto) 1fr;gap:10px;padding:8px 10px;display:grid}.paui-commands button:hover{background:var(--paui-surface)}.paui-commands code{color:var(--paui-accent);font-family:var(--paui-mono);font-size:11px}.paui-commands span{color:var(--paui-text-muted);font-size:11px}.paui-to-bottom{border:1px solid var(--paui-border);background:var(--paui-surface-raised);box-shadow:var(--paui-shadow-raised);border-radius:50%;position:sticky;bottom:12px;left:calc(50% - 17px)}.paui-drawer-backdrop{z-index:20;background:0 0;justify-content:flex-end;display:flex;position:absolute;inset:0}.paui-drawer{border-left:1px solid var(--paui-border);background:var(--paui-background);width:min(340px,88%);height:100%;min-height:0;box-shadow:var(--paui-shadow-raised);grid-template-rows:auto minmax(0,1fr);display:grid}.paui-drawer>header{border-bottom:1px solid var(--paui-border);justify-content:space-between;align-items:center;min-height:56px;padding:10px 12px 10px 16px;display:flex}.paui-session-list{overscroll-behavior:contain;scrollbar-color:var(--paui-border) transparent;scrollbar-gutter:stable;gap:2px;min-height:0;padding:8px;display:grid;overflow-y:auto}.paui-session{border-radius:9px;grid-template-columns:minmax(0,1fr) auto;align-items:center;display:grid}.paui-session[data-active=true]{background:var(--paui-accent-soft)}.paui-session>button:first-child{text-align:left;background:0 0;border:0;min-width:0;padding:9px 8px;display:grid}.paui-session>button:first-child strong{text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.paui-session>button:first-child span{color:var(--paui-text-muted);font-size:10px}.paui-load-more{margin-top:6px}.paui-error-text{color:var(--paui-danger);padding:8px;font-size:11px}.paui-sr-only{clip:rect(0, 0, 0, 0);white-space:nowrap;border:0;width:1px;height:1px;padding:0;position:absolute;overflow:hidden}@container pretty-aui (width<=560px){.paui-header{min-height:48px;padding:7px 8px 7px 12px}.paui-identity--child{gap:4px}.paui-identity--child .paui-presence,.paui-lineage__ancestor{display:none}.paui-lineage{align-items:center;display:flex}.paui-lineage__back{display:inline-grid}.paui-lineage__titles{flex:auto;min-width:0}.paui-body{padding-top:18px;padding-bottom:120px}.paui-message[data-role=user]{max-width:88%}.paui-markdown{font-size:15px;line-height:25px}.paui-message[data-role=user] .paui-markdown{font-size:15px;line-height:23px}.paui-interaction__actions{align-items:stretch}.paui-button-primary,.paui-button-secondary,.paui-button-ghost{flex:auto}.paui-composer-wrap{padding-left:10px;padding-right:10px}.paui-composer{padding-left:14px}}.pretty-aui[data-surface=sidebar] .paui-identity--child{gap:4px}.pretty-aui[data-surface=sidebar] :is(.paui-identity--child .paui-presence,.paui-lineage__ancestor){display:none}.pretty-aui[data-surface=sidebar] .paui-lineage{align-items:center;display:flex}.pretty-aui[data-surface=sidebar] .paui-lineage__back{display:inline-grid}@container pretty-aui (width<=380px){.paui-identity{gap:7px}.paui-protocol{display:none}.paui-message[data-role=user]{max-width:92%}.paui-interaction{padding:11px}.paui-interaction__icon{display:none}}@media (prefers-reduced-motion:reduce){.pretty-aui *,.pretty-aui :before,.pretty-aui :after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}", Pc = "Acp-Connection-Id", Fc = "Acp-Session-Id", Ic = "text/event-stream", Lc = "application/json";
I.session_cancel, I.session_close, I.session_delete, I.session_fork, I.session_load, I.session_prompt, I.session_resume, I.session_set_config_option, I.session_set_mode, I.nes_suggest, I.nes_accept, I.nes_reject, I.nes_close, I.document_did_open, I.document_did_change, I.document_did_close, I.document_did_save, I.document_did_focus;
function Rc(e) {
	if (!Ke(e)) return;
	let t = e.sessionId;
	return typeof t == "string" ? t : void 0;
}
function zc(e) {
	return "method" in e ? Rc(e.params) : void 0;
}
function Bc(e) {
	if (!ue(e) || !("result" in e) || !Ke(e.result)) return;
	let t = e.result.sessionId;
	return typeof t == "string" ? t : void 0;
}
function Vc(e) {
	return e.jsonrpc === "2.0" && "id" in e && "method" in e && e.method === I.initialize;
}
function Hc(e) {
	if (typeof e == "string") return `string:${e}`;
	if (typeof e == "number") return `number:${e}`;
	if (e === null) return "null";
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/cookie-store.js
var Uc = class {
	cookies = /* @__PURE__ */ new Map();
	store(e) {
		for (let t of Wc(e)) {
			let e = Kc(t);
			e && this.cookies.set(e.name, e.value);
		}
	}
	apply(e) {
		let t = qc(this.cookieHeader(), e.get("Cookie"));
		t && e.set("Cookie", t);
	}
	clear() {
		this.cookies.clear();
	}
	cookieHeader() {
		return this.cookies.size === 0 ? void 0 : Array.from(this.cookies).map(([e, t]) => `${e}=${t}`).join("; ");
	}
};
function Wc(e) {
	let t = e.getSetCookie;
	if (typeof t == "function") return t.call(e).flatMap(Gc);
	let n = e.get("Set-Cookie");
	return n ? Gc(n) : [];
}
function Gc(e) {
	return e.split(/,(?=\s*[^;,\s]+=)/).map((e) => e.trim()).filter((e) => e.length > 0);
}
function Kc(e) {
	let t = e.split(";", 1)[0], n = t.indexOf("=");
	if (n <= 0) return;
	let r = t.slice(0, n).trim();
	if (r) return {
		name: r,
		value: t.slice(n + 1).trim()
	};
}
function qc(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let t of Jc(e)) n.set(t.name, t.value);
	for (let e of Jc(t ?? void 0)) n.set(e.name, e.value);
	return n.size === 0 ? void 0 : Array.from(n).map(([e, t]) => `${e}=${t}`).join("; ");
}
function Jc(e) {
	return e ? e.split(";").map(Yc).filter((e) => e !== void 0) : [];
}
function Yc(e) {
	let t = e.indexOf("=");
	if (t <= 0) return;
	let n = e.slice(0, t).trim();
	if (n) return {
		name: n,
		value: e.slice(t + 1).trim()
	};
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/sse.js
async function* Xc(e) {
	let t = new TextDecoder(), n = e.getReader(), r = new Hn(), i = [], a = (e) => {
		let n = t.decode(e);
		return n.endsWith("\r") ? n.slice(0, -1) : n;
	}, o = () => {
		if (i.length === 0) return;
		let e = i;
		return i = [], Zc(e);
	};
	try {
		for (;;) {
			let e = await n.read();
			if (e.done) break;
			for (let t of r.push(e.value)) {
				let e = a(t);
				if (e === "") {
					let e = o();
					e && (yield e);
				} else i.push(e);
			}
		}
		let e = r.flush();
		if (e) {
			let t = a(e);
			t !== "" && i.push(t);
		}
		let t = o();
		t && (yield t);
	} finally {
		n.releaseLock();
	}
}
function Zc(e) {
	let t = e.filter((e) => e.startsWith("data:")).map((e) => {
		let t = e.slice(5);
		return t.startsWith(" ") ? t.slice(1) : t;
	});
	if (t.length === 0) return;
	let n = t.join("\n");
	if (n.trim()) try {
		let e = JSON.parse(n);
		if (Ke(e) || Array.isArray(e)) return e;
		console.warn("Skipping SSE payload that is not an object or array");
		return;
	} catch (e) {
		console.warn("Failed to parse SSE JSON payload:", e);
		return;
	}
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/http-stream.js
function Qc(e, t = {}) {
	return new $c(e, t).stream;
}
var $c = class {
	serverUrl;
	stream;
	fetchImpl;
	headers;
	cookiePolicy;
	cookieStore;
	ownsCookieStore;
	abortController = new AbortController();
	knownSessions = /* @__PURE__ */ new Set();
	sessionSseReady = /* @__PURE__ */ new Map();
	pendingResponseSessions = /* @__PURE__ */ new Map();
	pendingSessionRequests = /* @__PURE__ */ new Map();
	readableController;
	connectionId;
	isClosed = !1;
	writeChain = Promise.resolve();
	constructor(e, t) {
		this.serverUrl = e, this.fetchImpl = el(t.fetch), this.headers = t.headers ?? {}, this.cookiePolicy = t.cookies ?? "include", this.cookieStore = t.cookieStore ?? new Uc(), this.ownsCookieStore = t.cookieStore === void 0, this.stream = {
			readable: new ReadableStream({
				start: (e) => {
					this.readableController = e;
				},
				cancel: () => this.close()
			}),
			writable: new WritableStream({
				write: (e) => (this.writeChain = this.writeChain.then(() => this.writeMessage(e)), this.writeChain),
				close: () => this.close(),
				abort: () => this.close()
			})
		};
	}
	async writeMessage(e) {
		if (this.isClosed) throw Error("ACP HTTP stream is closed");
		if (Array.isArray(e)) throw TypeError("ACP HTTP transport does not support JSON-RPC batch messages");
		if (!this.connectionId) {
			await this.postInitialize(e);
			return;
		}
		await this.postConnectedMessage(e);
	}
	async postInitialize(e) {
		let t;
		try {
			if (!Vc(e)) throw Error("ACP HTTP stream first message must be initialize");
			let n = await this.fetchRequest({
				method: "POST",
				headers: { "Content-Type": Lc },
				body: JSON.stringify(e),
				signal: this.abortController.signal
			});
			if (!n.ok) throw await tl("ACP initialize failed", n);
			let r = n.headers.get(Pc);
			if (!r) throw Error("ACP initialize response missing Acp-Connection-Id");
			t = r, this.throwIfClosedDuringInitialize();
			let i = await n.json();
			if (this.throwIfClosedDuringInitialize(), !ue(i)) throw Error("ACP initialize response was not a JSON-RPC response");
			if (Hc(i.id) !== ("id" in e ? Hc(e.id) : void 0)) throw Error("ACP initialize response id did not match initialize request");
			this.connectionId = r, this.openConnectionSse(), this.enqueue(i);
		} catch (e) {
			throw this.isClosed && t ? (await this.deleteConnection(t).catch(() => void 0), this.clearOwnedCookieStore()) : this.errorReadable(e, t), e;
		}
	}
	throwIfClosedDuringInitialize() {
		if (this.isClosed) throw Error("ACP HTTP stream is closed");
	}
	async postConnectedMessage(e) {
		let t = this.connectionId;
		if (!t) throw Error("ACP HTTP stream is not initialized");
		let n = this.sessionIdForOutboundMessage(e);
		n && await this.openSessionSse(n);
		let r = n && "method" in e && "id" in e ? Hc(e.id) : void 0;
		n && r && this.pendingSessionRequests.set(r, n);
		try {
			let r = await this.fetchRequest({
				method: "POST",
				headers: {
					"Content-Type": Lc,
					[Pc]: t,
					...n ? { [Fc]: n } : {}
				},
				body: JSON.stringify(e),
				signal: this.abortController.signal
			});
			if (!r.ok) throw await tl("ACP POST failed", r);
			if (!("method" in e) && "id" in e) {
				let t = Hc(e.id);
				t && this.pendingResponseSessions.delete(t);
			}
		} catch (e) {
			throw r && this.pendingSessionRequests.delete(r), this.errorReadable(e), e;
		}
	}
	sessionIdForOutboundMessage(e) {
		let t = zc(e);
		if (t) return t;
		if (!("id" in e) || "method" in e) return;
		let n = Hc(e.id);
		return n ? this.pendingResponseSessions.get(n) : void 0;
	}
	openConnectionSse() {
		let e = this.connectionId;
		e && this.openSse({ [Pc]: e });
	}
	openSessionSse(e) {
		let t = this.sessionSseReady.get(e);
		if (t) return t;
		if (this.knownSessions.has(e)) return Promise.resolve();
		let n = this.connectionId;
		if (!n) return Promise.resolve();
		let r = !1, i = () => {}, a = () => {}, o = new Promise((e, t) => {
			i = e, a = t;
		}), s = (e) => {
			r || (r = !0, e());
		};
		return o.catch(() => void 0), this.knownSessions.add(e), this.sessionSseReady.set(e, o), this.openSse({
			[Pc]: n,
			[Fc]: e
		}, {
			onOpen: () => {
				s(i);
			},
			onError: (e) => {
				s(() => {
					a(e);
				});
			},
			onClose: () => {
				this.sessionSseReady.delete(e), s(() => {
					a(/* @__PURE__ */ Error("ACP session SSE stream closed before opening"));
				});
			}
		}), o;
	}
	async openSse(e, t = {}) {
		let n = e[Fc];
		try {
			let r = await this.fetchRequest({
				method: "GET",
				headers: {
					Accept: Ic,
					...e
				},
				signal: this.abortController.signal
			});
			if (!r.ok) throw await tl("ACP SSE connection failed", r);
			if (!r.body) throw Error("ACP SSE response missing body");
			t.onOpen?.();
			for await (let t of Xc(r.body)) {
				if (this.isClosed) return;
				if (Array.isArray(t)) throw TypeError("ACP HTTP transport does not support JSON-RPC batch messages");
				let n = Bc(t);
				n && this.openSessionSse(n), this.trackServerRequestRoute(t, e[Fc]), this.trackInboundResponse(t), this.enqueue(t);
			}
			this.handleSseEof(n);
		} catch (e) {
			if (this.isClosed || this.abortController.signal.aborted) return;
			t.onError?.(e), this.errorReadable(e);
		} finally {
			t.onClose?.();
		}
	}
	handleSseEof(e) {
		if (!(this.isClosed || this.abortController.signal.aborted)) {
			if (!e) {
				this.errorReadable(/* @__PURE__ */ Error("ACP connection SSE stream closed"));
				return;
			}
			this.knownSessions.delete(e), this.sessionSseReady.delete(e), this.hasPendingSessionRequest(e) && this.errorReadable(/* @__PURE__ */ Error("ACP session SSE stream closed"));
		}
	}
	trackServerRequestRoute(e, t) {
		if (!t || !("method" in e) || !("id" in e)) return;
		let n = Hc(e.id);
		n && this.pendingResponseSessions.set(n, t);
	}
	trackInboundResponse(e) {
		if (!ue(e)) return;
		let t = Hc(e.id);
		t && this.pendingSessionRequests.delete(t);
	}
	hasPendingSessionRequest(e) {
		for (let t of this.pendingSessionRequests.values()) if (t === e) return !0;
		return !1;
	}
	async fetchRequest(e) {
		let t = await this.fetchImpl(this.serverUrl, {
			...e,
			credentials: this.cookiePolicy,
			headers: this.createRequestHeaders(e.headers)
		});
		return this.cookiePolicy === "include" && this.cookieStore.store(t.headers), t;
	}
	createRequestHeaders(e) {
		let t = new Headers(this.headers);
		return new Headers(e).forEach((e, n) => {
			t.set(n, e);
		}), this.cookiePolicy === "include" && this.cookieStore.apply(t), t;
	}
	async close() {
		if (!this.isClosed) {
			this.isClosed = !0, this.abortController.abort();
			try {
				await this.deleteConnection();
			} finally {
				this.clearOwnedCookieStore(), this.closeReadable();
			}
		}
	}
	async deleteConnection(e = this.connectionId) {
		if (!e) return;
		let t = await this.fetchRequest({
			method: "DELETE",
			headers: { [Pc]: e }
		});
		if (!t.ok) throw await tl("ACP DELETE failed", t);
	}
	clearOwnedCookieStore() {
		this.ownsCookieStore && this.cookieStore.clear();
	}
	enqueue(e) {
		try {
			this.readableController?.enqueue(e);
		} catch (e) {
			this.errorReadable(e);
		}
	}
	errorReadable(e, t = this.connectionId) {
		if (!this.isClosed) {
			this.isClosed = !0, this.abortController.abort(), this.deleteConnection(t).catch(() => void 0).finally(() => {
				this.clearOwnedCookieStore();
			});
			try {
				this.readableController?.error(e);
			} catch {}
		}
	}
	closeReadable() {
		try {
			this.readableController?.close();
		} catch {}
	}
};
function el(e) {
	if (e) return e;
	if (typeof globalThis.fetch == "function") return (e, t) => globalThis.fetch(e, t);
	throw Error("createHttpStream requires globalThis.fetch or options.fetch");
}
async function tl(e, t) {
	let n = await t.text().catch(() => "");
	return Error(n ? `${e}: ${t.status} ${t.statusText}: ${n}` : `${e}: ${t.status} ${t.statusText}`);
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/ws-utils.js
function nl(e, t, n) {
	if (e.on) {
		let r = (...e) => {
			n(...il(t, e));
		};
		return e.on(t, r), () => {
			if (e.off) {
				e.off(t, r);
				return;
			}
			e.removeListener?.(t, r);
		};
	}
	if (e.addEventListener) {
		let r = (e) => n(e);
		return e.addEventListener(t, r), () => {
			e.removeEventListener?.(t, r);
		};
	}
	throw Error("WebSocket object does not support event listeners");
}
function rl(e) {
	let t = ol(e);
	if (typeof t == "string") return t;
}
function il(e, t) {
	return e !== "message" || typeof t[1] != "boolean" ? t : t[1] ? [void 0] : [al(t[0])];
}
function al(e) {
	if (typeof e == "string") return e;
	if (e instanceof ArrayBuffer || ArrayBuffer.isView(e)) return new TextDecoder().decode(e);
	if (cl(e)) return ll(e);
}
function ol(e) {
	let [t] = e;
	return sl(t) ? t.data : t;
}
function sl(e) {
	return typeof e == "object" && !!e && "data" in e;
}
function cl(e) {
	return Array.isArray(e) && e.every(ArrayBuffer.isView);
}
function ll(e) {
	let t = e.reduce((e, t) => e + t.byteLength, 0), n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(new Uint8Array(t.buffer, t.byteOffset, t.byteLength), r), r += t.byteLength;
	return new TextDecoder().decode(n);
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/ws-stream.js
var ul = 1;
function dl(e, t = {}) {
	return new fl(e, t).stream;
}
var fl = class {
	stream;
	socket;
	cookieStore;
	ownsCookieStore;
	readableController;
	isClosed = !1;
	openPromise;
	resolveOpen;
	rejectOpen;
	detachListeners = [];
	sendQueue = Promise.resolve();
	constructor(e, t) {
		let n = _l(t.WebSocket), r = t.cookies ?? "include";
		this.cookieStore = t.cookieStore ?? new Uc(), this.ownsCookieStore = t.cookieStore === void 0, this.socket = new n(e, t.protocols, { headers: pl(t.headers, r, this.cookieStore) }), this.openPromise = new Promise((e, t) => {
			this.resolveOpen = e, this.rejectOpen = t;
		}), this.openPromise.catch(() => void 0), this.detachListeners.push(nl(this.socket, "open", () => {
			this.resolveOpen?.(), this.resolveOpen = void 0, this.rejectOpen = void 0, this.openPromise = void 0;
		})), this.detachListeners.push(nl(this.socket, "message", (...e) => {
			this.handleSocketMessage(e);
		})), this.detachListeners.push(nl(this.socket, "close", () => {
			this.closeReadable();
		})), this.detachListeners.push(nl(this.socket, "error", (e) => {
			this.errorReadable(e);
		})), r === "include" && this.detachListeners.push(nl(this.socket, "upgrade", (e) => {
			let t = hl(e);
			t && this.cookieStore.store(t);
		})), this.stream = {
			readable: new ReadableStream({
				start: (e) => {
					this.readableController = e;
				},
				cancel: () => {
					this.close();
				}
			}),
			writable: new WritableStream({
				write: (e) => this.queueMessage(e),
				close: () => {
					this.close();
				},
				abort: () => {
					this.close();
				}
			})
		};
	}
	queueMessage(e) {
		let t = this.sendQueue.then(() => this.sendMessage(e));
		return this.sendQueue = t.catch(() => {}), t;
	}
	async sendMessage(e) {
		if (this.isClosed || (await this.waitForOpen(), this.isClosed)) throw Error("ACP WebSocket stream is closed");
		this.socket.send(JSON.stringify(e));
	}
	async waitForOpen() {
		this.socket.readyState !== void 0 && this.socket.readyState !== ul && await this.openPromise;
	}
	handleSocketMessage(e) {
		if (this.isClosed) return;
		let t = rl(e);
		if (t === void 0) return;
		let n;
		try {
			n = JSON.parse(t);
		} catch {
			this.sendProtocolError(Ue.parseError());
			return;
		}
		if (!Ke(n) && !Array.isArray(n)) {
			this.sendProtocolError(Ue.invalidRequest(n));
			return;
		}
		this.readableController?.enqueue(n);
	}
	sendProtocolError(e) {
		this.queueMessage(Ge(e)).catch((e) => {
			this.errorReadable(e);
		});
	}
	close() {
		this.closeSocket(), this.closeReadable();
	}
	closeSocket() {
		try {
			this.socket.close();
		} catch (e) {
			console.warn("Failed to close ACP WebSocket:", e);
		}
	}
	clearOwnedCookieStore() {
		this.ownsCookieStore && this.cookieStore.clear();
	}
	closeReadable() {
		if (!this.isClosed) {
			this.isClosed = !0, this.clearOwnedCookieStore();
			for (let e of this.detachListeners.splice(0)) e();
			this.rejectOpen?.(/* @__PURE__ */ Error("ACP WebSocket stream closed before open")), this.rejectOpen = void 0, this.resolveOpen = void 0, this.openPromise = void 0;
			try {
				this.readableController?.close();
			} catch {}
		}
	}
	errorReadable(e) {
		if (!this.isClosed) {
			this.isClosed = !0, this.clearOwnedCookieStore();
			for (let e of this.detachListeners.splice(0)) e();
			this.rejectOpen?.(e), this.rejectOpen = void 0, this.resolveOpen = void 0, this.openPromise = void 0, this.readableController?.error(e);
		}
	}
};
function pl(e, t, n) {
	let r = e ? { ...e } : {};
	if (t === "include") {
		let t = new Headers(e);
		n.apply(t);
		let i = t.get("Cookie");
		i && (r[ml(r, "Cookie") ?? "Cookie"] = i);
	}
	return Object.keys(r).length > 0 ? r : void 0;
}
function ml(e, t) {
	return Object.keys(e).find((e) => e.toLowerCase() === t.toLowerCase());
}
function hl(e) {
	if (e instanceof Headers) return e;
	if (!(!Ke(e) || !("headers" in e))) return gl(e.headers);
}
function gl(e) {
	if (e instanceof Headers) return e;
	if (!Ke(e)) return;
	let t = new Headers();
	for (let [n, r] of Object.entries(e)) {
		if (Array.isArray(r)) {
			for (let e of r) t.append(n, String(e));
			continue;
		}
		r !== void 0 && t.set(n, String(r));
	}
	return t;
}
function _l(e) {
	if (e) return e;
	if (typeof globalThis.WebSocket == "function") return globalThis.WebSocket;
	throw Error("createWebSocketStream requires globalThis.WebSocket or options.WebSocket");
}
//#endregion
//#region src/core/transport.ts
function vl(e, t = {}) {
	let n = bl(e, t.fetch ?? globalThis.fetch);
	return { open({ signal: r }) {
		return xl(Qc(e, {
			fetch: n,
			...t.headers ? { headers: { ...t.headers } } : {},
			...t.cookies ? { cookies: t.cookies } : {}
		}), r);
	} };
}
function yl(e, t = {}) {
	return { open({ signal: n }) {
		return xl(dl(e, {
			...t.protocols ? { protocols: [...t.protocols] } : {},
			...t.headers ? { headers: { ...t.headers } } : {},
			...t.cookies ? { cookies: t.cookies } : {},
			...t.WebSocket ? { WebSocket: t.WebSocket } : {}
		}), n);
	} };
}
function bl(e, t) {
	if (!t) throw new l("INVALID_CONFIGURATION", "Streamable HTTP requires a fetch implementation", { phase: "transport/http" });
	let n = Sl(e);
	return async (e, r) => {
		let i = Cl(e, n);
		for (let a = 0; a <= 5; a += 1) {
			let o = await t(e, {
				...r,
				redirect: "manual"
			});
			if (o.type === "opaqueredirect") throw new l("INVALID_CONFIGURATION", "ACP HTTP redirects are opaque in browsers; configure a redirect-free endpoint", { phase: "transport/redirect" });
			if (!wl(o.status)) return o;
			let s = o.headers.get("location");
			if (!s) return o;
			let c = new URL(s, i);
			if (c.origin !== n.origin) throw new l("INVALID_CONFIGURATION", `ACP HTTP redirect crossed an origin boundary: ${c.origin}`, { phase: "transport/redirect" });
			if (a === 5) throw new l("INVALID_CONFIGURATION", "ACP HTTP exceeded the redirect limit", { phase: "transport/redirect" });
			e = c.href, i = c;
		}
		throw Error("Unreachable redirect state");
	};
}
function xl(e, t) {
	let n = e.readable.getReader(), r = e.writable.getWriter(), i, a = !1, o = (e) => {
		if (!a) {
			a = !0, t.removeEventListener("abort", s);
			try {
				i?.error(e);
			} catch {}
			r.abort(e).catch(() => n.cancel(e)).catch(() => void 0);
		}
	}, s = () => o(t.reason);
	return t.addEventListener("abort", s, { once: !0 }), {
		readable: new ReadableStream({
			start(e) {
				i = e, t.aborted && o(t.reason);
			},
			async pull(e) {
				if (a) return;
				let r = await n.read();
				if (r.done) {
					a = !0, t.removeEventListener("abort", s), e.close();
					return;
				}
				if (!Tl(r.value)) {
					o(new l("PROTOCOL_VIOLATION", "ACP wire message exceeded the 2 MiB decoded input limit", { phase: "transport/input" }));
					return;
				}
				e.enqueue(r.value);
			},
			cancel(e) {
				o(e);
			}
		}),
		writable: new WritableStream({
			write(e) {
				if (a) throw Error("ACP transport lifetime has ended");
				return r.write(e);
			},
			async close() {
				a || (a = !0, t.removeEventListener("abort", s), await r.close());
			},
			abort(e) {
				o(e);
			}
		})
	};
}
function Sl(e) {
	try {
		return new URL(e, globalThis.location === void 0 ? void 0 : globalThis.location.href);
	} catch (t) {
		throw new l("INVALID_CONFIGURATION", `ACP HTTP endpoint must be an absolute URL: ${e}`, {
			cause: t,
			phase: "transport/http"
		});
	}
}
function Cl(e, t) {
	return typeof e == "string" ? new URL(e, t) : e instanceof URL ? e : new URL(e.url, t);
}
function wl(e) {
	return e >= 300 && e <= 399;
}
function Tl(e) {
	let t = 0, n = 0, r = /* @__PURE__ */ new WeakSet(), i = [{
		value: e,
		depth: 0
	}];
	for (; i.length;) {
		let e = i.pop();
		if (!e) break;
		if (n += 1, n > 32768 || e.depth > 64) return !1;
		if (typeof e.value == "string") t += El(e.value, 2097152 - t);
		else if (typeof e.value == "number") t += 8;
		else if (e.value !== null && typeof e.value == "object") {
			if (r.has(e.value)) return !1;
			if (r.add(e.value), Array.isArray(e.value)) for (let t of e.value) i.push({
				value: t,
				depth: e.depth + 1
			});
			else for (let [n, r] of Object.entries(e.value)) t += El(n, 2097152 - t), i.push({
				value: r,
				depth: e.depth + 1
			});
		}
		if (t > 2097152) return !1;
	}
	return !0;
}
function El(e, t) {
	let n = 0;
	for (let r = 0; r < e.length; r += 1) {
		let i = e.charCodeAt(r);
		if (i <= 127 ? n += 1 : i <= 2047 ? n += 2 : i >= 55296 && i <= 56319 && r + 1 < e.length && e.charCodeAt(r + 1) >= 56320 && e.charCodeAt(r + 1) <= 57343 ? (n += 4, r += 1) : n += 3, n > t) return n;
	}
	return n;
}
//#endregion
//#region src/standalone.tsx
var Dl = /* @__PURE__ */ new WeakMap(), Ol = /* @__PURE__ */ new WeakMap();
function kl(e, t) {
	if (Dl.has(e)) throw Error("pretty-aui: this target is already mounted");
	let n = Ol.get(e);
	if (e.shadowRoot && e.shadowRoot !== n) throw Error("pretty-aui: mountChat requires a target without an existing shadow root");
	let r = n ?? e.attachShadow({ mode: "open" });
	Ol.set(e, r);
	let i = document.createElement("style");
	i.textContent = Nc;
	let a = document.createElement("div");
	a.className = "pretty-aui-standalone-root", r.append(i, a);
	let o = {
		shadow: r,
		style: i,
		container: a
	};
	Dl.set(e, o);
	let { surface: s, colorScheme: c, labels: l, ...u } = t, d = Hr(u), f = zn(a);
	f.render(/* @__PURE__ */ Q(us, {
		controller: d,
		surface: s,
		colorScheme: c,
		labels: l
	}));
	let p = !1, m, h = async () => {
		if (!p) {
			p = !0, m?.disconnect();
			try {
				f.unmount();
			} finally {
				try {
					await d.destroy();
				} finally {
					Dl.get(e) === o && (i.remove(), a.remove(), Dl.delete(e));
				}
			}
		}
	};
	return typeof MutationObserver < "u" && (m = Al(e, () => void h())), {
		controller: d,
		ready: d.ready,
		unmount: h
	};
}
function Al(e, t) {
	let n = e.isConnected, r = new MutationObserver(() => {
		if (n && !e.isConnected) {
			t();
			return;
		}
		i();
	}), i = () => {
		if (r.disconnect(), !e.isConnected) {
			r.observe(e.ownerDocument.documentElement, {
				childList: !0,
				subtree: !0
			});
			return;
		}
		n = !0;
		let t = e;
		for (;;) {
			if (t.parentNode) {
				r.observe(t.parentNode, { childList: !0 }), t = t.parentNode;
				continue;
			}
			let e = t.getRootNode();
			if (e instanceof ShadowRoot) {
				t = e.host;
				continue;
			}
			break;
		}
	};
	return i(), r;
}
//#endregion
export { l as PrettyAuiError, Hr as createChat, vl as createStreamableHttpConnector, yl as createWebSocketConnector, kl as mountChat };

//# sourceMappingURL=pretty-aui.js.map