//#region src/core/errors.ts
var e = class extends Error {
	code;
	protocol;
	phase;
	retryable;
	accepted;
	completionUnknown;
	constructor(e, t, n = {}) {
		super(t, { cause: n.cause }), this.name = "PrettyAuiError", this.code = e, this.phase = n.phase ?? "unknown", this.retryable = n.retryable ?? !1, n.protocol !== void 0 && (this.protocol = n.protocol), n.accepted !== void 0 && (this.accepted = n.accepted), n.completionUnknown !== void 0 && (this.completionUnknown = n.completionUnknown);
	}
};
function t(t) {
	return t instanceof e ? {
		code: t.code,
		message: t.message,
		retryable: t.retryable,
		...t.accepted === void 0 ? {} : { accepted: t.accepted },
		...t.completionUnknown === void 0 ? {} : { completionUnknown: t.completionUnknown }
	} : {
		code: "UNKNOWN",
		message: t instanceof Error ? t.message : String(t),
		retryable: !1
	};
}
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
var n, r = /*@__PURE__*/ Object.freeze({ status: "aborted" });
function i(e, t, n) {
	function r(n, r) {
		if (n._zod || Object.defineProperty(n, "_zod", {
			value: {
				def: r,
				constr: o,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: !1
		}), n._zod.traits.has(e)) return;
		n._zod.traits.add(e), t(n, r);
		let i = o.prototype, a = Object.keys(i);
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			t in n || (n[t] = i[t].bind(n));
		}
	}
	let i = n?.Parent ?? Object;
	class a extends i {}
	Object.defineProperty(a, "name", { value: e });
	function o(e) {
		var t;
		let i = n?.Parent ? new a() : this;
		r(i, e), (t = i._zod).deferred ?? (t.deferred = []);
		for (let e of i._zod.deferred) e();
		return i;
	}
	return Object.defineProperty(o, "init", { value: r }), Object.defineProperty(o, Symbol.hasInstance, { value: (t) => n?.Parent && t instanceof n.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(o, "name", { value: e }), o;
}
var a = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, o = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(n = globalThis).__zod_globalConfig ?? (n.__zod_globalConfig = {});
var s = globalThis.__zod_globalConfig;
function c(e) {
	return e && Object.assign(s, e), s;
}
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
function l(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function u(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
function d(e) {
	return { get value() {
		{
			let t = e();
			return Object.defineProperty(this, "value", { value: t }), t;
		}
	} };
}
function f(e) {
	return e == null;
}
function p(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function ee(e, t) {
	let n = e / t, r = Math.round(n), i = 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
var te = /* @__PURE__*/ Symbol("evaluating");
function m(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== te) return r === void 0 && (r = te, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function h(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function g(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function ne(e) {
	return JSON.stringify(e);
}
function re(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var ie = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function ae(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var oe = /* @__PURE__*/ d(() => {
	if (s.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function se(e) {
	if (ae(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return ae(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function ce(e) {
	return se(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var le = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function ue(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function _(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function v(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function de(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
var fe = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pe(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	return _(e, g(e._zod.def, {
		get shape() {
			let e = {};
			for (let r in t) {
				if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
				t[r] && (e[r] = n.shape[r]);
			}
			return h(this, "shape", e), e;
		},
		checks: []
	}));
}
function me(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	return _(e, g(e._zod.def, {
		get shape() {
			let r = { ...e._zod.def.shape };
			for (let e in t) {
				if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
				t[e] && delete r[e];
			}
			return h(this, "shape", r), r;
		},
		checks: []
	}));
}
function he(e, t) {
	if (!se(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = e._zod.def.shape;
		for (let e in t) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return _(e, g(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return h(this, "shape", n), n;
	} }));
}
function ge(e, t) {
	if (!se(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return _(e, g(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return h(this, "shape", n), n;
	} }));
}
function _e(e, t) {
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	return _(e, g(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t._zod.def.shape
			};
			return h(this, "shape", n), n;
		},
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function ve(e, t, n) {
	let r = t._zod.def.checks;
	if (r && r.length > 0) throw Error(".partial() cannot be used on object schemas containing refinements");
	return _(t, g(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = e ? new e({
					type: "optional",
					innerType: r[t]
				}) : r[t]);
			}
			else for (let t in r) i[t] = e ? new e({
				type: "optional",
				innerType: r[t]
			}) : r[t];
			return h(this, "shape", i), i;
		},
		checks: []
	}));
}
function ye(e, t, n) {
	return _(t, g(t._zod.def, { get shape() {
		let r = t._zod.def.shape, i = { ...r };
		if (n) for (let t in n) {
			if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
			n[t] && (i[t] = new e({
				type: "nonoptional",
				innerType: r[t]
			}));
		}
		else for (let t in r) i[t] = new e({
			type: "nonoptional",
			innerType: r[t]
		});
		return h(this, "shape", i), i;
	} }));
}
function be(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function xe(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Se(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Ce(e) {
	return typeof e == "string" ? e : e?.message;
}
function y(e, t, n) {
	let r = e.message ? e.message : Ce(e.inst?._zod.def?.error?.(e)) ?? Ce(t?.error?.(e)) ?? Ce(n.customError?.(e)) ?? Ce(n.localeError?.(e)) ?? "Invalid input", { inst: i, continue: a, input: o, ...s } = e;
	return s.path ??= [], s.message = r, t?.reportInput && (s.input = o), s;
}
function we(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Te(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
var Ee = (e, t) => {
	e.name = "$ZodError", Object.defineProperty(e, "_zod", {
		value: e._zod,
		enumerable: !1
	}), Object.defineProperty(e, "issues", {
		value: t,
		enumerable: !1
	}), e.message = JSON.stringify(t, u, 2), Object.defineProperty(e, "toString", {
		value: () => e.message,
		enumerable: !1
	});
}, De = i("$ZodError", Ee), Oe = i("$ZodError", Ee, { Parent: Error });
function ke(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Ae(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i];
					i === e.length - 1 ? (r[n] = r[n] || { _errors: [] }, r[n]._errors.push(t(a))) : r[n] = r[n] || { _errors: [] }, r = r[n], i++;
				}
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
var je = (e) => (t, n, r, i) => {
	let o = r ? {
		...r,
		async: !1
	} : { async: !1 }, s = t._zod.run({
		value: n,
		issues: []
	}, o);
	if (s instanceof Promise) throw new a();
	if (s.issues.length) {
		let t = new ((i?.Err) ?? e)(s.issues.map((e) => y(e, o, c())));
		throw ie(t, i?.callee), t;
	}
	return s.value;
}, Me = (e) => async (t, n, r, i) => {
	let a = r ? {
		...r,
		async: !0
	} : { async: !0 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise && (o = await o), o.issues.length) {
		let t = new ((i?.Err) ?? e)(o.issues.map((e) => y(e, a, c())));
		throw ie(t, i?.callee), t;
	}
	return o.value;
}, Ne = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, o = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (o instanceof Promise) throw new a();
	return o.issues.length ? {
		success: !1,
		error: new (e ?? De)(o.issues.map((e) => y(e, i, c())))
	} : {
		success: !0,
		data: o.value
	};
}, Pe = /* @__PURE__*/ Ne(Oe), Fe = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? {
		success: !1,
		error: new e(a.issues.map((e) => y(e, i, c())))
	} : {
		success: !0,
		data: a.value
	};
}, Ie = /* @__PURE__*/ Fe(Oe), Le = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return je(e)(t, n, i);
}, Re = (e) => (t, n, r) => je(e)(t, n, r), ze = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Me(e)(t, n, i);
}, Be = (e) => async (t, n, r) => Me(e)(t, n, r), Ve = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Ne(e)(t, n, i);
}, He = (e) => (t, n, r) => Ne(e)(t, n, r), Ue = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Fe(e)(t, n, i);
}, We = (e) => async (t, n, r) => Fe(e)(t, n, r), Ge = /^[cC][0-9a-z]{6,}$/, Ke = /^[0-9a-z]+$/, qe = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Je = /^[0-9a-vA-V]{20}$/, Ye = /^[A-Za-z0-9]{27}$/, Xe = /^[a-zA-Z0-9_-]{21}$/, Ze = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Qe = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, $e = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, et = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, tt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function nt() {
	return new RegExp(tt, "u");
}
var rt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, it = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, at = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, ot = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, st = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, ct = /^[A-Za-z0-9_-]*$/, lt = /^https?$/, ut = /^\+[1-9]\d{6,14}$/, dt = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", ft = /*@__PURE__*/ RegExp(`^${dt}$`);
function pt(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function mt(e) {
	return RegExp(`^${pt(e)}$`);
}
function ht(e) {
	let t = pt({ precision: e.precision }), n = ["Z"];
	e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let r = `${t}(?:${n.join("|")})`;
	return RegExp(`^${dt}T(?:${r})$`);
}
var gt = (e) => {
	let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
	return RegExp(`^${t}$`);
}, _t = /^-?\d+$/, vt = /^-?\d+(?:\.\d+)?$/, yt = /^(?:true|false)$/i, bt = /^[^A-Z]*$/, xt = /^[^a-z]*$/, b = /*@__PURE__*/ i("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), St = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Ct = /*@__PURE__*/ i("$ZodCheckLessThan", (e, t) => {
	b.init(e, t);
	let n = St[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.maximum : n.exclusiveMaximum) ?? Infinity;
		t.value < r && (t.inclusive ? n.maximum = t.value : n.exclusiveMaximum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), wt = /*@__PURE__*/ i("$ZodCheckGreaterThan", (e, t) => {
	b.init(e, t);
	let n = St[typeof t.value];
	e._zod.onattach.push((e) => {
		let n = e._zod.bag, r = (t.inclusive ? n.minimum : n.exclusiveMinimum) ?? -Infinity;
		t.value > r && (t.inclusive ? n.minimum = t.value : n.exclusiveMinimum = t.value);
	}), e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Tt = /*@__PURE__*/ i("$ZodCheckMultipleOf", (e, t) => {
	b.init(e, t), e._zod.onattach.push((e) => {
		var n;
		(n = e._zod.bag).multipleOf ?? (n.multipleOf = t.value);
	}), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : ee(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Et = /*@__PURE__*/ i("$ZodCheckNumberFormat", (e, t) => {
	b.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = fe[t.format];
	e._zod.onattach.push((e) => {
		let r = e._zod.bag;
		r.format = t.format, r.minimum = i, r.maximum = a, n && (r.pattern = _t);
	}), e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), Dt = /*@__PURE__*/ i("$ZodCheckMaxLength", (e, t) => {
	var n;
	b.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !f(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length <= t.maximum) return;
		let i = we(r);
		n.issues.push({
			origin: i,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Ot = /*@__PURE__*/ i("$ZodCheckMinLength", (e, t) => {
	var n;
	b.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !f(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length >= t.minimum) return;
		let i = we(r);
		n.issues.push({
			origin: i,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), kt = /*@__PURE__*/ i("$ZodCheckLengthEquals", (e, t) => {
	var n;
	b.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !f(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.length, n.maximum = t.length, n.length = t.length;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if (i === t.length) return;
		let a = we(r), o = i > t.length;
		n.issues.push({
			origin: a,
			...o ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), At = /*@__PURE__*/ i("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	b.init(e, t), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, t.pattern && (n.patterns ??= /* @__PURE__ */ new Set(), n.patterns.add(t.pattern));
	}), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), jt = /*@__PURE__*/ i("$ZodCheckRegex", (e, t) => {
	At.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), Mt = /*@__PURE__*/ i("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= bt, At.init(e, t);
}), Nt = /*@__PURE__*/ i("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= xt, At.init(e, t);
}), Pt = /*@__PURE__*/ i("$ZodCheckIncludes", (e, t) => {
	b.init(e, t);
	let n = ue(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
	t.pattern = r, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(r);
	}), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Ft = /*@__PURE__*/ i("$ZodCheckStartsWith", (e, t) => {
	b.init(e, t);
	let n = RegExp(`^${ue(t.prefix)}.*`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), It = /*@__PURE__*/ i("$ZodCheckEndsWith", (e, t) => {
	b.init(e, t);
	let n = RegExp(`.*${ue(t.suffix)}$`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Lt = /*@__PURE__*/ i("$ZodCheckOverwrite", (e, t) => {
	b.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Rt = class {
	constructor(e = []) {
		this.content = [], this.indent = 0, this && (this.args = e);
	}
	indented(e) {
		this.indent += 1, e(this), --this.indent;
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.args, n = [...(this?.content ?? [""]).map((e) => `  ${e}`)];
		return new e(...t, n.join("\n"));
	}
}, zt = {
	major: 4,
	minor: 4,
	patch: 3
}, x = /*@__PURE__*/ i("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = zt;
	let r = [...e._zod.def.checks ?? []];
	e._zod.traits.has("$ZodCheck") && r.unshift(e);
	for (let t of r) for (let n of t._zod.onattach) n(e);
	if (r.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (e, t, n) => {
			let r = be(e), i;
			for (let o of t) {
				if (o._zod.def.when) {
					if (xe(e) || !o._zod.def.when(e)) continue;
				} else if (r) continue;
				let t = e.issues.length, s = o._zod.check(e);
				if (s instanceof Promise && n?.async === !1) throw new a();
				if (i || s instanceof Promise) i = (i ?? Promise.resolve()).then(async () => {
					await s, e.issues.length !== t && (r ||= be(e, t));
				});
				else {
					if (e.issues.length === t) continue;
					r ||= be(e, t);
				}
			}
			return i ? i.then(() => e) : e;
		}, n = (n, i, o) => {
			if (be(n)) return n.aborted = !0, n;
			let s = t(i, r, o);
			if (s instanceof Promise) {
				if (o.async === !1) throw new a();
				return s.then((t) => e._zod.parse(t, o));
			}
			return e._zod.parse(s, o);
		};
		e._zod.run = (i, o) => {
			if (o.skipChecks) return e._zod.parse(i, o);
			if (o.direction === "backward") {
				let t = e._zod.parse({
					value: i.value,
					issues: []
				}, {
					...o,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, i, o)) : n(t, i, o);
			}
			let s = e._zod.parse(i, o);
			if (s instanceof Promise) {
				if (o.async === !1) throw new a();
				return s.then((e) => t(e, r, o));
			}
			return t(s, r, o);
		};
	}
	m(e, "~standard", () => ({
		validate: (t) => {
			try {
				let n = Pe(e, t);
				return n.success ? { value: n.data } : { issues: n.error?.issues };
			} catch {
				return Ie(e, t).then((e) => e.success ? { value: e.data } : { issues: e.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
}), Bt = /*@__PURE__*/ i("$ZodString", (e, t) => {
	x.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? gt(e._zod.bag), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), S = /*@__PURE__*/ i("$ZodStringFormat", (e, t) => {
	At.init(e, t), Bt.init(e, t);
}), Vt = /*@__PURE__*/ i("$ZodGUID", (e, t) => {
	t.pattern ??= Qe, S.init(e, t);
}), Ht = /*@__PURE__*/ i("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= $e(e);
	} else t.pattern ??= $e();
	S.init(e, t);
}), Ut = /*@__PURE__*/ i("$ZodEmail", (e, t) => {
	t.pattern ??= et, S.init(e, t);
}), Wt = /*@__PURE__*/ i("$ZodURL", (e, t) => {
	S.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim();
			if (!t.normalize && t.protocol?.source === lt.source && !/^https?:\/\//i.test(r)) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			let i = new URL(r);
			t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(i.hostname) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(i.protocol.endsWith(":") ? i.protocol.slice(0, -1) : i.protocol) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), n.value = t.normalize ? i.href : r;
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), Gt = /*@__PURE__*/ i("$ZodEmoji", (e, t) => {
	t.pattern ??= nt(), S.init(e, t);
}), Kt = /*@__PURE__*/ i("$ZodNanoID", (e, t) => {
	t.pattern ??= Xe, S.init(e, t);
}), qt = /*@__PURE__*/ i("$ZodCUID", (e, t) => {
	t.pattern ??= Ge, S.init(e, t);
}), Jt = /*@__PURE__*/ i("$ZodCUID2", (e, t) => {
	t.pattern ??= Ke, S.init(e, t);
}), Yt = /*@__PURE__*/ i("$ZodULID", (e, t) => {
	t.pattern ??= qe, S.init(e, t);
}), Xt = /*@__PURE__*/ i("$ZodXID", (e, t) => {
	t.pattern ??= Je, S.init(e, t);
}), Zt = /*@__PURE__*/ i("$ZodKSUID", (e, t) => {
	t.pattern ??= Ye, S.init(e, t);
}), Qt = /*@__PURE__*/ i("$ZodISODateTime", (e, t) => {
	t.pattern ??= ht(t), S.init(e, t);
}), $t = /*@__PURE__*/ i("$ZodISODate", (e, t) => {
	t.pattern ??= ft, S.init(e, t);
}), en = /*@__PURE__*/ i("$ZodISOTime", (e, t) => {
	t.pattern ??= mt(t), S.init(e, t);
}), tn = /*@__PURE__*/ i("$ZodISODuration", (e, t) => {
	t.pattern ??= Ze, S.init(e, t);
}), nn = /*@__PURE__*/ i("$ZodIPv4", (e, t) => {
	t.pattern ??= rt, S.init(e, t), e._zod.bag.format = "ipv4";
}), rn = /*@__PURE__*/ i("$ZodIPv6", (e, t) => {
	t.pattern ??= it, S.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
		try {
			new URL(`http://[${n.value}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), an = /*@__PURE__*/ i("$ZodCIDRv4", (e, t) => {
	t.pattern ??= at, S.init(e, t);
}), on = /*@__PURE__*/ i("$ZodCIDRv6", (e, t) => {
	t.pattern ??= ot, S.init(e, t), e._zod.check = (n) => {
		let r = n.value.split("/");
		try {
			if (r.length !== 2) throw Error();
			let [e, t] = r;
			if (!t) throw Error();
			let n = Number(t);
			if (`${n}` !== t || n < 0 || n > 128) throw Error();
			new URL(`http://[${e}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
});
function sn(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var cn = /*@__PURE__*/ i("$ZodBase64", (e, t) => {
	t.pattern ??= st, S.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
		sn(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function ln(e) {
	if (!ct.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return sn(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var un = /*@__PURE__*/ i("$ZodBase64URL", (e, t) => {
	t.pattern ??= ct, S.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
		ln(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), dn = /*@__PURE__*/ i("$ZodE164", (e, t) => {
	t.pattern ??= ut, S.init(e, t);
});
function fn(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var pn = /*@__PURE__*/ i("$ZodJWT", (e, t) => {
	S.init(e, t), e._zod.check = (n) => {
		fn(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), mn = /*@__PURE__*/ i("$ZodNumber", (e, t) => {
	x.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? vt, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : "Infinity" : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), hn = /*@__PURE__*/ i("$ZodNumberFormat", (e, t) => {
	Et.init(e, t), mn.init(e, t);
}), gn = /*@__PURE__*/ i("$ZodBoolean", (e, t) => {
	x.init(e, t), e._zod.pattern = yt, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), _n = /*@__PURE__*/ i("$ZodUnknown", (e, t) => {
	x.init(e, t), e._zod.parse = (e) => e;
}), vn = /*@__PURE__*/ i("$ZodNever", (e, t) => {
	x.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function yn(e, t, n) {
	e.issues.length && t.issues.push(...Se(n, e.issues)), t.value[n] = e.value;
}
var bn = /*@__PURE__*/ i("$ZodArray", (e, t) => {
	x.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!Array.isArray(i)) return n.issues.push({
			expected: "array",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		n.value = Array(i.length);
		let a = [];
		for (let e = 0; e < i.length; e++) {
			let o = i[e], s = t.element._zod.run({
				value: o,
				issues: []
			}, r);
			s instanceof Promise ? a.push(s.then((t) => yn(t, n, e))) : yn(s, n, e);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function xn(e, t, n, r, i, a) {
	let o = n in r;
	if (e.issues.length) {
		if (i && a && !o) return;
		t.issues.push(...Se(n, e.issues));
	}
	if (!o && !i) {
		e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		});
		return;
	}
	e.value === void 0 ? o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function Sn(e) {
	let t = Object.keys(e.shape);
	for (let n of t) if (!e.shape?.[n]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${n}": expected a Zod schema`);
	let n = de(e.shape);
	return {
		...e,
		keys: t,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(n)
	};
}
function Cn(e, t, n, r, i, a) {
	let o = [], s = i.keySet, c = i.catchall._zod, l = c.def.type, u = c.optin === "optional", d = c.optout === "optional";
	for (let i in t) {
		if (i === "__proto__" || s.has(i)) continue;
		if (l === "never") {
			o.push(i);
			continue;
		}
		let a = c.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => xn(e, n, i, t, u, d))) : xn(a, n, i, t, u, d);
	}
	return o.length && n.issues.push({
		code: "unrecognized_keys",
		keys: o,
		input: t,
		inst: a
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var wn = /*@__PURE__*/ i("$ZodObject", (e, t) => {
	if (x.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
		let e = t.shape;
		Object.defineProperty(t, "shape", { get: () => {
			let n = { ...e };
			return Object.defineProperty(t, "shape", { value: n }), n;
		} });
	}
	let n = d(() => Sn(t));
	m(e._zod, "propValues", () => {
		let e = t.shape, n = {};
		for (let t in e) {
			let r = e[t]._zod;
			if (r.values) {
				n[t] ?? (n[t] = /* @__PURE__ */ new Set());
				for (let e of r.values) n[t].add(e);
			}
		}
		return n;
	});
	let r = ae, i = t.catchall, a;
	e._zod.parse = (t, o) => {
		a ??= n.value;
		let s = t.value;
		if (!r(s)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: s,
			inst: e
		}), t;
		t.value = {};
		let c = [], l = a.shape;
		for (let e of a.keys) {
			let n = l[e], r = n._zod.optin === "optional", i = n._zod.optout === "optional", a = n._zod.run({
				value: s[e],
				issues: []
			}, o);
			a instanceof Promise ? c.push(a.then((n) => xn(n, t, e, s, r, i))) : xn(a, t, e, s, r, i);
		}
		return i ? Cn(c, s, t, o, n.value, e) : c.length ? Promise.all(c).then(() => t) : t;
	};
}), Tn = /*@__PURE__*/ i("$ZodObjectJIT", (e, t) => {
	wn.init(e, t);
	let n = e._zod.parse, r = d(() => Sn(t)), i = (e) => {
		let t = new Rt([
			"shape",
			"payload",
			"ctx"
		]), n = r.value, i = (e) => {
			let t = ne(e);
			return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
		};
		t.write("const input = payload.value;");
		let a = Object.create(null), o = 0;
		for (let e of n.keys) a[e] = `key_${o++}`;
		t.write("const newResult = {};");
		for (let r of n.keys) {
			let n = a[r], o = ne(r), s = e[r], c = s?._zod?.optin === "optional", l = s?._zod?.optout === "optional";
			t.write(`const ${n} = ${i(r)};`), c && l ? t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : c ? t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : t.write(`
        const ${n}_present = ${o} in input;
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${o}]
          });
        }

        if (${n}_present) {
          if (${n}.value === undefined) {
            newResult[${o}] = undefined;
          } else {
            newResult[${o}] = ${n}.value;
          }
        }

      `);
		}
		t.write("payload.value = newResult;"), t.write("return payload;");
		let s = t.compile();
		return (t, n) => s(e, t, n);
	}, a, o = ae, c = !s.jitless, l = c && oe.value, u = t.catchall, f;
	e._zod.parse = (s, d) => {
		f ??= r.value;
		let p = s.value;
		return o(p) ? c && l && d?.async === !1 && d.jitless !== !0 ? (a ||= i(t.shape), s = a(s, d), u ? Cn([], p, s, d, f, e) : s) : n(s, d) : (s.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), s);
	};
});
function En(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !be(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => y(e, r, c())))
	}), t);
}
var Dn = /*@__PURE__*/ i("$ZodUnion", (e, t) => {
	x.init(e, t), m(e._zod, "optin", () => t.options.some((e) => e._zod.optin === "optional") ? "optional" : void 0), m(e._zod, "optout", () => t.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), m(e._zod, "values", () => {
		if (t.options.every((e) => e._zod.values)) return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
	}), m(e._zod, "pattern", () => {
		if (t.options.every((e) => e._zod.pattern)) {
			let e = t.options.map((e) => e._zod.pattern);
			return RegExp(`^(${e.map((e) => p(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => En(t, r, e, i)) : En(o, r, e, i);
	};
}), On = /*@__PURE__*/ i("$ZodIntersection", (e, t) => {
	x.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => An(e, t, n)) : An(e, i, a);
	};
});
function kn(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (se(e) && se(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = kn(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = kn(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function An(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i;
	for (let n of t.issues) if (n.code === "unrecognized_keys") {
		i ??= n;
		for (let e of n.keys) r.has(e) || r.set(e, {}), r.get(e).l = !0;
	} else e.issues.push(n);
	for (let t of n.issues) if (t.code === "unrecognized_keys") for (let e of t.keys) r.has(e) || r.set(e, {}), r.get(e).r = !0;
	else e.issues.push(t);
	let a = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (a.length && i && e.issues.push({
		...i,
		keys: a
	}), be(e)) return e;
	let o = kn(t.value, n.value);
	if (!o.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);
	return e.value = o.data, e;
}
var jn = /*@__PURE__*/ i("$ZodRecord", (e, t) => {
	x.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!se(i)) return n.issues.push({
			expected: "record",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		let a = [], o = t.keyType._zod.values;
		if (o) {
			n.value = {};
			let s = /* @__PURE__ */ new Set();
			for (let l of o) if (typeof l == "string" || typeof l == "number" || typeof l == "symbol") {
				s.add(typeof l == "number" ? l.toString() : l);
				let o = t.keyType._zod.run({
					value: l,
					issues: []
				}, r);
				if (o instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (o.issues.length) {
					n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: o.issues.map((e) => y(e, r, c())),
						input: l,
						path: [l],
						inst: e
					});
					continue;
				}
				let u = o.value, d = t.valueType._zod.run({
					value: i[l],
					issues: []
				}, r);
				d instanceof Promise ? a.push(d.then((e) => {
					e.issues.length && n.issues.push(...Se(l, e.issues)), n.value[u] = e.value;
				})) : (d.issues.length && n.issues.push(...Se(l, d.issues)), n.value[u] = d.value);
			}
			let l;
			for (let e in i) s.has(e) || (l ??= [], l.push(e));
			l && l.length > 0 && n.issues.push({
				code: "unrecognized_keys",
				input: i,
				inst: e,
				keys: l
			});
		} else {
			n.value = {};
			for (let o of Reflect.ownKeys(i)) {
				if (o === "__proto__" || !Object.prototype.propertyIsEnumerable.call(i, o)) continue;
				let s = t.keyType._zod.run({
					value: o,
					issues: []
				}, r);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (typeof o == "string" && vt.test(o) && s.issues.length) {
					let e = t.keyType._zod.run({
						value: Number(o),
						issues: []
					}, r);
					if (e instanceof Promise) throw Error("Async schemas not supported in object keys currently");
					e.issues.length === 0 && (s = e);
				}
				if (s.issues.length) {
					t.mode === "loose" ? n.value[o] = i[o] : n.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => y(e, r, c())),
						input: o,
						path: [o],
						inst: e
					});
					continue;
				}
				let l = t.valueType._zod.run({
					value: i[o],
					issues: []
				}, r);
				l instanceof Promise ? a.push(l.then((e) => {
					e.issues.length && n.issues.push(...Se(o, e.issues)), n.value[s.value] = e.value;
				})) : (l.issues.length && n.issues.push(...Se(o, l.issues)), n.value[s.value] = l.value);
			}
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
}), Mn = /*@__PURE__*/ i("$ZodEnum", (e, t) => {
	x.init(e, t);
	let n = l(t.entries), r = new Set(n);
	e._zod.values = r, e._zod.pattern = RegExp(`^(${n.filter((e) => le.has(typeof e)).map((e) => typeof e == "string" ? ue(e) : e.toString()).join("|")})$`), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Nn = /*@__PURE__*/ i("$ZodLiteral", (e, t) => {
	if (x.init(e, t), t.values.length === 0) throw Error("Cannot create literal schema with no valid values");
	let n = new Set(t.values);
	e._zod.values = n, e._zod.pattern = RegExp(`^(${t.values.map((e) => typeof e == "string" ? ue(e) : e ? ue(e.toString()) : String(e)).join("|")})$`), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), Pn = /*@__PURE__*/ i("$ZodTransform", (e, t) => {
	x.init(e, t), e._zod.optin = "optional", e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new o(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n.fallback = !0, n));
		if (i instanceof Promise) throw new a();
		return n.value = i, n.fallback = !0, n;
	};
});
function Fn(e, t) {
	return t === void 0 && (e.issues.length || e.fallback) ? {
		issues: [],
		value: void 0
	} : e;
}
var In = /*@__PURE__*/ i("$ZodOptional", (e, t) => {
	x.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", m(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), m(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${p(e.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (t.innerType._zod.optin === "optional") {
			let r = e.value, i = t.innerType._zod.run(e, n);
			return i instanceof Promise ? i.then((e) => Fn(e, r)) : Fn(i, r);
		}
		return e.value === void 0 ? e : t.innerType._zod.run(e, n);
	};
}), Ln = /*@__PURE__*/ i("$ZodExactOptional", (e, t) => {
	In.init(e, t), m(e._zod, "values", () => t.innerType._zod.values), m(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Rn = /*@__PURE__*/ i("$ZodNullable", (e, t) => {
	x.init(e, t), m(e._zod, "optin", () => t.innerType._zod.optin), m(e._zod, "optout", () => t.innerType._zod.optout), m(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${p(e.source)}|null)$`) : void 0;
	}), m(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), zn = /*@__PURE__*/ i("$ZodDefault", (e, t) => {
	x.init(e, t), e._zod.optin = "optional", m(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Bn(e, t)) : Bn(r, t);
	};
});
function Bn(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var Vn = /*@__PURE__*/ i("$ZodPrefault", (e, t) => {
	x.init(e, t), e._zod.optin = "optional", m(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), Hn = /*@__PURE__*/ i("$ZodNonOptional", (e, t) => {
	x.init(e, t), m(e._zod, "values", () => {
		let e = t.innerType._zod.values;
		return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => Un(t, e)) : Un(i, e);
	};
});
function Un(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
var Wn = /*@__PURE__*/ i("$ZodCatch", (e, t) => {
	x.init(e, t), e._zod.optin = "optional", m(e._zod, "optout", () => t.innerType._zod.optout), m(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((r) => (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => y(e, n, c())) },
			input: e.value
		}), e.issues = [], e.fallback = !0), e)) : (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => y(e, n, c())) },
			input: e.value
		}), e.issues = [], e.fallback = !0), e);
	};
}), Gn = /*@__PURE__*/ i("$ZodPipe", (e, t) => {
	x.init(e, t), m(e._zod, "values", () => t.in._zod.values), m(e._zod, "optin", () => t.in._zod.optin), m(e._zod, "optout", () => t.out._zod.optout), m(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Kn(e, t.in, n)) : Kn(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Kn(e, t.out, n)) : Kn(r, t.out, n);
	};
});
function Kn(e, t, n) {
	return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues,
		fallback: e.fallback
	}, n);
}
var qn = /*@__PURE__*/ i("$ZodReadonly", (e, t) => {
	x.init(e, t), m(e._zod, "propValues", () => t.innerType._zod.propValues), m(e._zod, "values", () => t.innerType._zod.values), m(e._zod, "optin", () => t.innerType?._zod?.optin), m(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(Jn) : Jn(r);
	};
});
function Jn(e) {
	return e.value = Object.freeze(e.value), e;
}
var Yn = /*@__PURE__*/ i("$ZodCustom", (e, t) => {
	b.init(e, t), x.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Xn(t, n, r, e));
		Xn(i, n, r, e);
	};
});
function Xn(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Te(e));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
var Zn, Qn = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function $n() {
	return new Qn();
}
(Zn = globalThis).__zod_globalRegistry ?? (Zn.__zod_globalRegistry = $n());
var er = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function tr(e, t) {
	return new e({
		type: "string",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function nr(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function rr(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ir(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ar(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function or(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function cr(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function lr(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ur(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function dr(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fr(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pr(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function mr(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function hr(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function gr(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _r(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function vr(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function yr(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function br(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xr(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Sr(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Cr(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wr(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Tr(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Er(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Or(e, t) {
	return new e({
		type: "number",
		checks: [],
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function kr(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ar(e, t) {
	return new e({
		type: "boolean",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function jr(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Mr(e, t) {
	return new e({
		type: "never",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Nr(e, t) {
	return new Ct({
		check: "less_than",
		...v(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Pr(e, t) {
	return new Ct({
		check: "less_than",
		...v(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Fr(e, t) {
	return new wt({
		check: "greater_than",
		...v(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Ir(e, t) {
	return new wt({
		check: "greater_than",
		...v(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Lr(e, t) {
	return new Tt({
		check: "multiple_of",
		...v(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Rr(e, t) {
	return new Dt({
		check: "max_length",
		...v(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function zr(e, t) {
	return new Ot({
		check: "min_length",
		...v(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Br(e, t) {
	return new kt({
		check: "length_equals",
		...v(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function Vr(e, t) {
	return new jt({
		check: "string_format",
		format: "regex",
		...v(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Hr(e) {
	return new Mt({
		check: "string_format",
		format: "lowercase",
		...v(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Ur(e) {
	return new Nt({
		check: "string_format",
		format: "uppercase",
		...v(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Wr(e, t) {
	return new Pt({
		check: "string_format",
		format: "includes",
		...v(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Gr(e, t) {
	return new Ft({
		check: "string_format",
		format: "starts_with",
		...v(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Kr(e, t) {
	return new It({
		check: "string_format",
		format: "ends_with",
		...v(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function C(e) {
	return new Lt({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function qr(e) {
	return /* @__PURE__ */ C((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Jr() {
	return /* @__PURE__ */ C((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Yr() {
	return /* @__PURE__ */ C((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Xr() {
	return /* @__PURE__ */ C((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Zr() {
	return /* @__PURE__ */ C((e) => re(e));
}
// @__NO_SIDE_EFFECTS__
function Qr(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...v(n)
	});
}
// @__NO_SIDE_EFFECTS__
function $r(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...v(n)
	});
}
// @__NO_SIDE_EFFECTS__
function ei(e, t) {
	let n = /* @__PURE__ */ ti((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Te(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", r.input ??= t.value, r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Te(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function ti(e, t) {
	let n = new b({
		check: "custom",
		...v(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
function ni(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? er,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		external: e?.external ?? void 0
	};
}
function w(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o);
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, w(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Object.assign(o.schema, c), t.io === "input" && T(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function ri(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${a}`
			};
		}
		if (t[1] === n) return { ref: "#" };
		let i = `#/${r}/`, a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + a
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		if (r.count > 1 && e.reused === "ref") {
			a(n);
			continue;
		}
	}
}
function ii(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Object.assign(i, s), Object.assign(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
			if (s.$ref && n.def) for (let e in i) e !== "$ref" && e !== "allOf" && e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e !== "$ref" && e !== "allOf" && e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	for (let t of [...e.seen.entries()].reverse()) r(t[0]);
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Object.assign(i, n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, o[e.defId] = e.def);
	}
	e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: oi(t, "input", e.processors),
					output: oi(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function T(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return T(r.element, n);
	if (r.type === "set") return T(r.valueType, n);
	if (r.type === "lazy") return T(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return T(r.innerType, n);
	if (r.type === "intersection") return T(r.left, n) || T(r.right, n);
	if (r.type === "record" || r.type === "map") return T(r.keyType, n) || T(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : T(r.in, n) || T(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (T(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (T(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (T(e, n)) return !0;
		return !!(r.rest && T(r.rest, n));
	}
	return !1;
}
var ai = (e, t = {}) => (n) => {
	let r = ni({
		...n,
		processors: t
	});
	return w(e, r), ri(r, e), ii(r, e);
}, oi = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = ni({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return w(e, o), ri(o, e), ii(o, e);
}, si = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, ci = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = si[s] ?? s, i.format === "" && delete i.format, s === "time" && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c];
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, li = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, format: s, multipleOf: c, exclusiveMaximum: l, exclusiveMinimum: u } = e._zod.bag;
	i.type = typeof s == "string" && s.includes("int") ? "integer" : "number";
	let d = typeof u == "number" && u >= (a ?? -Infinity), f = typeof l == "number" && l <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	d ? p ? (i.minimum = u, i.exclusiveMinimum = !0) : i.exclusiveMinimum = u : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = l, i.exclusiveMaximum = !0) : i.exclusiveMaximum = l : typeof o == "number" && (i.maximum = o), typeof c == "number" && (i.multipleOf = c);
}, ui = (e, t, n, r) => {
	n.type = "boolean";
}, di = (e, t, n, r) => {
	n.not = {};
}, fi = (e, t, n, r) => {
	let i = e._zod.def, a = l(i.entries);
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, pi = (e, t, n, r) => {
	let i = e._zod.def, a = [];
	for (let e of i.values) if (e === void 0) {
		if (t.unrepresentable === "throw") throw Error("Literal `undefined` cannot be represented in JSON Schema");
	} else if (typeof e == "bigint") {
		if (t.unrepresentable === "throw") throw Error("BigInt literals cannot be represented in JSON Schema");
		a.push(Number(e));
	} else a.push(e);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, mi = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
}, hi = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
}, gi = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = e._zod.bag;
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = w(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
}, _i = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object", i.properties = {};
	let o = a.shape;
	for (let e in o) i.properties[e] = w(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	});
	let s = new Set(Object.keys(o)), c = new Set([...s].filter((e) => {
		let n = a.shape[e]._zod;
		return t.io === "input" ? n.optin === void 0 : n.optout === void 0;
	}));
	c.size > 0 && (i.required = Array.from(c)), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = w(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, vi = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => w(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, yi = (e, t, n, r) => {
	let i = e._zod.def, a = w(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = w(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1;
	n.allOf = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
}, bi = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = o._zod.bag?.patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = w(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) i.patternProperties[t.source] = e;
	} else (t.target === "draft-07" || t.target === "draft-2020-12") && (i.propertyNames = w(a.keyType, t, {
		...r,
		path: [...r.path, "propertyNames"]
	})), i.additionalProperties = w(a.valueType, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	});
	let c = o._zod.values;
	if (c) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e);
	}
}, xi = (e, t, n, r) => {
	let i = e._zod.def, a = w(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Si = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Ci = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.default = JSON.parse(JSON.stringify(i.defaultValue));
}, wi = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue)));
}, Ti = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		throw Error("Dynamic catch values are not supported in JSON Schema");
	}
	n.default = o;
}, Ei = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	w(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Di = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Oi = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, ki = /*@__PURE__*/ i("ZodISODateTime", (e, t) => {
	Qt.init(e, t), k.init(e, t);
});
function Ai(e) {
	return /* @__PURE__ */ wr(ki, e);
}
var ji = /*@__PURE__*/ i("ZodISODate", (e, t) => {
	$t.init(e, t), k.init(e, t);
});
function Mi(e) {
	return /* @__PURE__ */ Tr(ji, e);
}
var Ni = /*@__PURE__*/ i("ZodISOTime", (e, t) => {
	en.init(e, t), k.init(e, t);
});
function Pi(e) {
	return /* @__PURE__ */ Er(Ni, e);
}
var Fi = /*@__PURE__*/ i("ZodISODuration", (e, t) => {
	tn.init(e, t), k.init(e, t);
});
function Ii(e) {
	return /* @__PURE__ */ Dr(Fi, e);
}
var E = /*@__PURE__*/ i("ZodError", (e, t) => {
	De.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
		format: { value: (t) => Ae(e, t) },
		flatten: { value: (t) => ke(e, t) },
		addIssue: { value: (t) => {
			e.issues.push(t), e.message = JSON.stringify(e.issues, u, 2);
		} },
		addIssues: { value: (t) => {
			e.issues.push(...t), e.message = JSON.stringify(e.issues, u, 2);
		} },
		isEmpty: { get() {
			return e.issues.length === 0;
		} }
	});
}, { Parent: Error }), Li = /* @__PURE__ */ je(E), Ri = /* @__PURE__ */ Me(E), zi = /* @__PURE__ */ Ne(E), Bi = /* @__PURE__ */ Fe(E), Vi = /* @__PURE__ */ Le(E), Hi = /* @__PURE__ */ Re(E), Ui = /* @__PURE__ */ ze(E), Wi = /* @__PURE__ */ Be(E), Gi = /* @__PURE__ */ Ve(E), Ki = /* @__PURE__ */ He(E), qi = /* @__PURE__ */ Ue(E), Ji = /* @__PURE__ */ We(E), Yi = /* @__PURE__ */ new WeakMap();
function Xi(e, t, n) {
	let r = Object.getPrototypeOf(e), i = Yi.get(r);
	if (i || (i = /* @__PURE__ */ new Set(), Yi.set(r, i)), !i.has(t)) {
		i.add(t);
		for (let e in n) {
			let t = n[e];
			Object.defineProperty(r, e, {
				configurable: !0,
				enumerable: !1,
				get() {
					let n = t.bind(this);
					return Object.defineProperty(this, e, {
						configurable: !0,
						writable: !0,
						enumerable: !0,
						value: n
					}), n;
				},
				set(t) {
					Object.defineProperty(this, e, {
						configurable: !0,
						writable: !0,
						enumerable: !0,
						value: t
					});
				}
			});
		}
	}
}
var D = /*@__PURE__*/ i("ZodType", (e, t) => (x.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
	input: oi(e, "input"),
	output: oi(e, "output")
} }), e.toJSONSchema = ai(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.parse = (t, n) => Li(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => zi(e, t, n), e.parseAsync = async (t, n) => Ri(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => Bi(e, t, n), e.spa = e.safeParseAsync, e.encode = (t, n) => Vi(e, t, n), e.decode = (t, n) => Hi(e, t, n), e.encodeAsync = async (t, n) => Ui(e, t, n), e.decodeAsync = async (t, n) => Wi(e, t, n), e.safeEncode = (t, n) => Gi(e, t, n), e.safeDecode = (t, n) => Ki(e, t, n), e.safeEncodeAsync = async (t, n) => qi(e, t, n), e.safeDecodeAsync = async (t, n) => Ji(e, t, n), Xi(e, "ZodType", {
	check(...e) {
		let t = this.def;
		return this.clone(g(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return _(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(eo(e, t));
	},
	superRefine(e, t) {
		return this.check(to(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ C(e));
	},
	optional() {
		return Ia(this);
	},
	exactOptional() {
		return Ra(this);
	},
	nullable() {
		return Ba(this);
	},
	nullish() {
		return Ia(Ba(this));
	},
	nonoptional(e) {
		return Ka(this, e);
	},
	array() {
		return P(this);
	},
	or(e) {
		return I([this, e]);
	},
	and(e) {
		return L(this, e);
	},
	transform(e) {
		return Xa(this, Pa(e));
	},
	default(e) {
		return Ha(this, e);
	},
	prefault(e) {
		return Wa(this, e);
	},
	catch(e) {
		return Ja(this, e);
	},
	pipe(e) {
		return Xa(this, e);
	},
	readonly() {
		return Qa(this);
	},
	describe(e) {
		let t = this.clone();
		return er.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return er.get(this);
		let t = this.clone();
		return er.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e) {
		return e(this);
	}
}), Object.defineProperty(e, "description", {
	get() {
		return er.get(e)?.description;
	},
	configurable: !0
}), e)), Zi = /*@__PURE__*/ i("_ZodString", (e, t) => {
	Bt.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => ci(e, t, n, r);
	let n = e._zod.bag;
	e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, Xi(e, "_ZodString", {
		regex(...e) {
			return this.check(/* @__PURE__ */ Vr(...e));
		},
		includes(...e) {
			return this.check(/* @__PURE__ */ Wr(...e));
		},
		startsWith(...e) {
			return this.check(/* @__PURE__ */ Gr(...e));
		},
		endsWith(...e) {
			return this.check(/* @__PURE__ */ Kr(...e));
		},
		min(...e) {
			return this.check(/* @__PURE__ */ zr(...e));
		},
		max(...e) {
			return this.check(/* @__PURE__ */ Rr(...e));
		},
		length(...e) {
			return this.check(/* @__PURE__ */ Br(...e));
		},
		nonempty(...e) {
			return this.check(/* @__PURE__ */ zr(1, ...e));
		},
		lowercase(e) {
			return this.check(/* @__PURE__ */ Hr(e));
		},
		uppercase(e) {
			return this.check(/* @__PURE__ */ Ur(e));
		},
		trim() {
			return this.check(/* @__PURE__ */ Jr());
		},
		normalize(...e) {
			return this.check(/* @__PURE__ */ qr(...e));
		},
		toLowerCase() {
			return this.check(/* @__PURE__ */ Yr());
		},
		toUpperCase() {
			return this.check(/* @__PURE__ */ Xr());
		},
		slugify() {
			return this.check(/* @__PURE__ */ Zr());
		}
	});
}), Qi = /*@__PURE__*/ i("ZodString", (e, t) => {
	Bt.init(e, t), Zi.init(e, t), e.email = (t) => e.check(/* @__PURE__ */ nr($i, t)), e.url = (t) => e.check(/* @__PURE__ */ cr(na, t)), e.jwt = (t) => e.check(/* @__PURE__ */ Cr(va, t)), e.emoji = (t) => e.check(/* @__PURE__ */ lr(ia, t)), e.guid = (t) => e.check(/* @__PURE__ */ rr(ea, t)), e.uuid = (t) => e.check(/* @__PURE__ */ ir(ta, t)), e.uuidv4 = (t) => e.check(/* @__PURE__ */ ar(ta, t)), e.uuidv6 = (t) => e.check(/* @__PURE__ */ or(ta, t)), e.uuidv7 = (t) => e.check(/* @__PURE__ */ sr(ta, t)), e.nanoid = (t) => e.check(/* @__PURE__ */ ur(aa, t)), e.guid = (t) => e.check(/* @__PURE__ */ rr(ea, t)), e.cuid = (t) => e.check(/* @__PURE__ */ dr(oa, t)), e.cuid2 = (t) => e.check(/* @__PURE__ */ fr(sa, t)), e.ulid = (t) => e.check(/* @__PURE__ */ pr(ca, t)), e.base64 = (t) => e.check(/* @__PURE__ */ br(ha, t)), e.base64url = (t) => e.check(/* @__PURE__ */ xr(ga, t)), e.xid = (t) => e.check(/* @__PURE__ */ mr(la, t)), e.ksuid = (t) => e.check(/* @__PURE__ */ hr(ua, t)), e.ipv4 = (t) => e.check(/* @__PURE__ */ gr(da, t)), e.ipv6 = (t) => e.check(/* @__PURE__ */ _r(fa, t)), e.cidrv4 = (t) => e.check(/* @__PURE__ */ vr(pa, t)), e.cidrv6 = (t) => e.check(/* @__PURE__ */ yr(ma, t)), e.e164 = (t) => e.check(/* @__PURE__ */ Sr(_a, t)), e.datetime = (t) => e.check(Ai(t)), e.date = (t) => e.check(Mi(t)), e.time = (t) => e.check(Pi(t)), e.duration = (t) => e.check(Ii(t));
});
function O(e) {
	return /* @__PURE__ */ tr(Qi, e);
}
var k = /*@__PURE__*/ i("ZodStringFormat", (e, t) => {
	S.init(e, t), Zi.init(e, t);
}), $i = /*@__PURE__*/ i("ZodEmail", (e, t) => {
	Ut.init(e, t), k.init(e, t);
}), ea = /*@__PURE__*/ i("ZodGUID", (e, t) => {
	Vt.init(e, t), k.init(e, t);
}), ta = /*@__PURE__*/ i("ZodUUID", (e, t) => {
	Ht.init(e, t), k.init(e, t);
}), na = /*@__PURE__*/ i("ZodURL", (e, t) => {
	Wt.init(e, t), k.init(e, t);
});
function ra(e) {
	return /* @__PURE__ */ cr(na, e);
}
var ia = /*@__PURE__*/ i("ZodEmoji", (e, t) => {
	Gt.init(e, t), k.init(e, t);
}), aa = /*@__PURE__*/ i("ZodNanoID", (e, t) => {
	Kt.init(e, t), k.init(e, t);
}), oa = /*@__PURE__*/ i("ZodCUID", (e, t) => {
	qt.init(e, t), k.init(e, t);
}), sa = /*@__PURE__*/ i("ZodCUID2", (e, t) => {
	Jt.init(e, t), k.init(e, t);
}), ca = /*@__PURE__*/ i("ZodULID", (e, t) => {
	Yt.init(e, t), k.init(e, t);
}), la = /*@__PURE__*/ i("ZodXID", (e, t) => {
	Xt.init(e, t), k.init(e, t);
}), ua = /*@__PURE__*/ i("ZodKSUID", (e, t) => {
	Zt.init(e, t), k.init(e, t);
}), da = /*@__PURE__*/ i("ZodIPv4", (e, t) => {
	nn.init(e, t), k.init(e, t);
}), fa = /*@__PURE__*/ i("ZodIPv6", (e, t) => {
	rn.init(e, t), k.init(e, t);
}), pa = /*@__PURE__*/ i("ZodCIDRv4", (e, t) => {
	an.init(e, t), k.init(e, t);
}), ma = /*@__PURE__*/ i("ZodCIDRv6", (e, t) => {
	on.init(e, t), k.init(e, t);
}), ha = /*@__PURE__*/ i("ZodBase64", (e, t) => {
	cn.init(e, t), k.init(e, t);
}), ga = /*@__PURE__*/ i("ZodBase64URL", (e, t) => {
	un.init(e, t), k.init(e, t);
}), _a = /*@__PURE__*/ i("ZodE164", (e, t) => {
	dn.init(e, t), k.init(e, t);
}), va = /*@__PURE__*/ i("ZodJWT", (e, t) => {
	pn.init(e, t), k.init(e, t);
}), ya = /*@__PURE__*/ i("ZodNumber", (e, t) => {
	mn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => li(e, t, n, r), Xi(e, "ZodNumber", {
		gt(e, t) {
			return this.check(/* @__PURE__ */ Fr(e, t));
		},
		gte(e, t) {
			return this.check(/* @__PURE__ */ Ir(e, t));
		},
		min(e, t) {
			return this.check(/* @__PURE__ */ Ir(e, t));
		},
		lt(e, t) {
			return this.check(/* @__PURE__ */ Nr(e, t));
		},
		lte(e, t) {
			return this.check(/* @__PURE__ */ Pr(e, t));
		},
		max(e, t) {
			return this.check(/* @__PURE__ */ Pr(e, t));
		},
		int(e) {
			return this.check(j(e));
		},
		safe(e) {
			return this.check(j(e));
		},
		positive(e) {
			return this.check(/* @__PURE__ */ Fr(0, e));
		},
		nonnegative(e) {
			return this.check(/* @__PURE__ */ Ir(0, e));
		},
		negative(e) {
			return this.check(/* @__PURE__ */ Nr(0, e));
		},
		nonpositive(e) {
			return this.check(/* @__PURE__ */ Pr(0, e));
		},
		multipleOf(e, t) {
			return this.check(/* @__PURE__ */ Lr(e, t));
		},
		step(e, t) {
			return this.check(/* @__PURE__ */ Lr(e, t));
		},
		finite() {
			return this;
		}
	});
	let n = e._zod.bag;
	e.minValue = Math.max(n.minimum ?? -Infinity, n.exclusiveMinimum ?? -Infinity) ?? null, e.maxValue = Math.min(n.maximum ?? Infinity, n.exclusiveMaximum ?? Infinity) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? .5), e.isFinite = !0, e.format = n.format ?? null;
});
function A(e) {
	return /* @__PURE__ */ Or(ya, e);
}
var ba = /*@__PURE__*/ i("ZodNumberFormat", (e, t) => {
	hn.init(e, t), ya.init(e, t);
});
function j(e) {
	return /* @__PURE__ */ kr(ba, e);
}
var xa = /*@__PURE__*/ i("ZodBoolean", (e, t) => {
	gn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => ui(e, t, n, r);
});
function M(e) {
	return /* @__PURE__ */ Ar(xa, e);
}
var Sa = /*@__PURE__*/ i("ZodUnknown", (e, t) => {
	_n.init(e, t), D.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function N() {
	return /* @__PURE__ */ jr(Sa);
}
var Ca = /*@__PURE__*/ i("ZodNever", (e, t) => {
	vn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => di(e, t, n, r);
});
function wa(e) {
	return /* @__PURE__ */ Mr(Ca, e);
}
var Ta = /*@__PURE__*/ i("ZodArray", (e, t) => {
	bn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => gi(e, t, n, r), e.element = t.element, Xi(e, "ZodArray", {
		min(e, t) {
			return this.check(/* @__PURE__ */ zr(e, t));
		},
		nonempty(e) {
			return this.check(/* @__PURE__ */ zr(1, e));
		},
		max(e, t) {
			return this.check(/* @__PURE__ */ Rr(e, t));
		},
		length(e, t) {
			return this.check(/* @__PURE__ */ Br(e, t));
		},
		unwrap() {
			return this.element;
		}
	});
});
function P(e, t) {
	return /* @__PURE__ */ Qr(Ta, e, t);
}
var Ea = /*@__PURE__*/ i("ZodObject", (e, t) => {
	Tn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => _i(e, t, n, r), m(e, "shape", () => t.shape), Xi(e, "ZodObject", {
		keyof() {
			return ja(Object.keys(this._zod.def.shape));
		},
		catchall(e) {
			return this.clone({
				...this._zod.def,
				catchall: e
			});
		},
		passthrough() {
			return this.clone({
				...this._zod.def,
				catchall: N()
			});
		},
		loose() {
			return this.clone({
				...this._zod.def,
				catchall: N()
			});
		},
		strict() {
			return this.clone({
				...this._zod.def,
				catchall: wa()
			});
		},
		strip() {
			return this.clone({
				...this._zod.def,
				catchall: void 0
			});
		},
		extend(e) {
			return he(this, e);
		},
		safeExtend(e) {
			return ge(this, e);
		},
		merge(e) {
			return _e(this, e);
		},
		pick(e) {
			return pe(this, e);
		},
		omit(e) {
			return me(this, e);
		},
		partial(...e) {
			return ve(Fa, this, e[0]);
		},
		required(...e) {
			return ye(Ga, this, e[0]);
		}
	});
});
function F(e, t) {
	return new Ea({
		type: "object",
		shape: e ?? {},
		...v(t)
	});
}
var Da = /*@__PURE__*/ i("ZodUnion", (e, t) => {
	Dn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => vi(e, t, n, r), e.options = t.options;
});
function I(e, t) {
	return new Da({
		type: "union",
		options: e,
		...v(t)
	});
}
var Oa = /*@__PURE__*/ i("ZodIntersection", (e, t) => {
	On.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => yi(e, t, n, r);
});
function L(e, t) {
	return new Oa({
		type: "intersection",
		left: e,
		right: t
	});
}
var ka = /*@__PURE__*/ i("ZodRecord", (e, t) => {
	jn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => bi(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function R(e, t, n) {
	return !t || !t._zod ? new ka({
		type: "record",
		keyType: O(),
		valueType: e,
		...v(t)
	}) : new ka({
		type: "record",
		keyType: e,
		valueType: t,
		...v(n)
	});
}
var Aa = /*@__PURE__*/ i("ZodEnum", (e, t) => {
	Mn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => fi(e, t, n, r), e.enum = t.entries, e.options = Object.values(t.entries);
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Aa({
			...t,
			checks: [],
			...v(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Aa({
			...t,
			checks: [],
			...v(r),
			entries: i
		});
	};
});
function ja(e, t) {
	return new Aa({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...v(t)
	});
}
var Ma = /*@__PURE__*/ i("ZodLiteral", (e, t) => {
	Nn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => pi(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function z(e, t) {
	return new Ma({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...v(t)
	});
}
var Na = /*@__PURE__*/ i("ZodTransform", (e, t) => {
	Pn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => hi(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new o(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Te(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", t.input ??= n.value, t.inst ??= e, n.issues.push(Te(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n.fallback = !0, n)) : (n.value = i, n.fallback = !0, n);
	};
});
function Pa(e) {
	return new Na({
		type: "transform",
		transform: e
	});
}
var Fa = /*@__PURE__*/ i("ZodOptional", (e, t) => {
	In.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ia(e) {
	return new Fa({
		type: "optional",
		innerType: e
	});
}
var La = /*@__PURE__*/ i("ZodExactOptional", (e, t) => {
	Ln.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ra(e) {
	return new La({
		type: "optional",
		innerType: e
	});
}
var za = /*@__PURE__*/ i("ZodNullable", (e, t) => {
	Rn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => xi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ba(e) {
	return new za({
		type: "nullable",
		innerType: e
	});
}
var Va = /*@__PURE__*/ i("ZodDefault", (e, t) => {
	zn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ci(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Ha(e, t) {
	return new Va({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ce(t);
		}
	});
}
var Ua = /*@__PURE__*/ i("ZodPrefault", (e, t) => {
	Vn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => wi(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Wa(e, t) {
	return new Ua({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ce(t);
		}
	});
}
var Ga = /*@__PURE__*/ i("ZodNonOptional", (e, t) => {
	Hn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Si(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ka(e, t) {
	return new Ga({
		type: "nonoptional",
		innerType: e,
		...v(t)
	});
}
var qa = /*@__PURE__*/ i("ZodCatch", (e, t) => {
	Wn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ti(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ja(e, t) {
	return new qa({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : () => t
	});
}
var Ya = /*@__PURE__*/ i("ZodPipe", (e, t) => {
	Gn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ei(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Xa(e, t) {
	return new Ya({
		type: "pipe",
		in: e,
		out: t
	});
}
var Za = /*@__PURE__*/ i("ZodReadonly", (e, t) => {
	qn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => Di(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Qa(e) {
	return new Za({
		type: "readonly",
		innerType: e
	});
}
var $a = /*@__PURE__*/ i("ZodCustom", (e, t) => {
	Yn.init(e, t), D.init(e, t), e._zod.processJSONSchema = (t, n, r) => mi(e, t, n, r);
});
function eo(e, t = {}) {
	return /* @__PURE__ */ $r($a, e, t);
}
function to(e, t) {
	return /* @__PURE__ */ ei(e, t);
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/schema-deserialize.js
var no = Symbol("skippedItem");
function B(e, t) {
	return e.catch(t);
}
function V(e, t) {
	let n = e.catch(t);
	return N().transform((e, t) => e === void 0 ? (t.addIssue({
		code: "custom",
		message: "Required value is missing"
	}), r) : n.parse(e));
}
function ro(e, t) {
	if (typeof e != "object" || !e || Array.isArray(e)) return;
	let n = e[t];
	return typeof n == "string" ? n : void 0;
}
function io(e, t, n) {
	return e.superRefine((e, r) => {
		let i = ro(e, t);
		i !== void 0 && n.includes(i) && r.addIssue({
			code: "custom",
			path: [t],
			message: `${t} ${JSON.stringify(i)} is reserved by a known variant, but the value does not match that variant's schema`
		});
	});
}
function ao(e, t, n) {
	return N().transform((i, a) => {
		let o = e.safeParse(i);
		if (!o.success) {
			for (let e of o.error.issues) a.addIssue({
				...e,
				input: i
			});
			return r;
		}
		let s = o.data, c = ro(i, t);
		if (c !== void 0 && !n.includes(c)) {
			let e = i;
			for (let [t, n] of Object.entries(e)) t !== "__proto__" && (Object.hasOwn(s, t) || (s[t] = n));
		}
		return s;
	});
}
function H(e) {
	return P(e.catch(no)).transform((e) => e.filter((e) => e !== no));
}
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/schema/zod.gen.js
var U = I([A(), O()]).nullable(), W = O(), oo = F({
	sessionId: W,
	path: O(),
	content: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), so = F({
	sessionId: W,
	path: O(),
	line: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	limit: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), co = O(), lo = I([
	z("read"),
	z("edit"),
	z("delete"),
	z("move"),
	z("search"),
	z("execute"),
	z("think"),
	z("fetch"),
	z("switch_mode"),
	z("other")
]), uo = I([
	z("pending"),
	z("in_progress"),
	z("completed"),
	z("failed")
]), fo = F({
	audience: B(H(I([z("assistant"), z("user")])).nullish(), () => void 0),
	lastModified: B(O().nullish(), () => void 0),
	priority: B(A().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), po = F({
	annotations: B(fo.nullish(), () => void 0),
	text: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), mo = F({
	annotations: B(fo.nullish(), () => void 0),
	data: O(),
	mimeType: O(),
	uri: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ho = F({
	annotations: B(fo.nullish(), () => void 0),
	data: O(),
	mimeType: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), go = F({
	annotations: B(fo.nullish(), () => void 0),
	description: B(O().nullish(), () => void 0),
	mimeType: B(O().nullish(), () => void 0),
	name: O(),
	size: B(A().nullish(), () => void 0),
	title: B(O().nullish(), () => void 0),
	uri: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), _o = I([F({
	mimeType: B(O().nullish(), () => void 0),
	text: O(),
	uri: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), F({
	blob: O(),
	mimeType: B(O().nullish(), () => void 0),
	uri: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
})]), vo = F({
	annotations: B(fo.nullish(), () => void 0),
	resource: _o,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), yo = I([
	po.and(F({ type: z("text") })),
	mo.and(F({ type: z("image") })),
	ho.and(F({ type: z("audio") })),
	go.and(F({ type: z("resource_link") })),
	vo.and(F({ type: z("resource") }))
]), bo = F({
	content: yo,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), xo = F({
	path: O(),
	oldText: B(O().nullish(), () => void 0),
	newText: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), So = O(), Co = F({
	terminalId: So,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), wo = I([
	bo.and(F({ type: z("content") })),
	xo.and(F({ type: z("diff") })),
	Co.and(F({ type: z("terminal") }))
]), To = F({
	path: O(),
	line: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Eo = F({
	toolCallId: co,
	kind: B(lo.nullish(), () => void 0),
	status: B(uo.nullish(), () => void 0),
	title: B(O().nullish(), () => void 0),
	name: B(O().nullish(), () => void 0),
	content: B(H(wo).nullish(), () => void 0),
	locations: B(H(To).nullish(), () => void 0),
	rawInput: B(N().optional(), () => void 0),
	rawOutput: B(N().optional(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Do = O(), Oo = I([
	z("allow_once"),
	z("allow_always"),
	z("reject_once"),
	z("reject_always")
]), ko = F({
	sessionId: W,
	toolCall: Eo,
	options: P(F({
		optionId: Do,
		name: O(),
		kind: Oo,
		_meta: B(R(O(), N()).nullish(), () => void 0)
	})),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ao = F({
	name: O(),
	value: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), jo = F({
	sessionId: W,
	command: O(),
	args: B(H(O()).optional(), () => []),
	env: B(H(Ao).optional(), () => []),
	cwd: B(O().nullish(), () => void 0),
	outputByteLimit: B(A().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Mo = F({
	sessionId: W,
	terminalId: So,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), No = F({
	sessionId: W,
	terminalId: So,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Po = F({
	sessionId: W,
	terminalId: So,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Fo = F({
	sessionId: W,
	terminalId: So,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Io = F({
	sessionId: W,
	toolCallId: B(co.nullish(), () => void 0)
}), Lo = F({ requestId: U }), Ro = z("object"), zo = I([
	z("email"),
	z("uri"),
	z("date"),
	z("date-time")
]), Bo = F({
	const: O(),
	title: O(),
	description: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Vo = F({
	title: B(O().nullish(), () => void 0),
	description: B(O().nullish(), () => void 0),
	minLength: j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(),
	maxLength: j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(),
	pattern: O().nullish(),
	format: zo.nullish(),
	default: B(O().nullish(), () => void 0),
	enum: P(O()).nullish(),
	oneOf: P(Bo).nullish(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ho = F({
	title: B(O().nullish(), () => void 0),
	description: B(O().nullish(), () => void 0),
	minimum: A().nullish(),
	maximum: A().nullish(),
	default: B(A().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Uo = F({
	title: B(O().nullish(), () => void 0),
	description: B(O().nullish(), () => void 0),
	minimum: A().nullish(),
	maximum: A().nullish(),
	default: B(A().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Wo = F({
	title: B(O().nullish(), () => void 0),
	description: B(O().nullish(), () => void 0),
	default: B(M().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Go = F({
	enum: P(O()),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ko = F({
	anyOf: P(Bo),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), qo = ao(I([
	Go.and(F({ type: z("string") })),
	io(F({ type: O() }), "type", ["string"]),
	Ko
]), "type", ["string"]), Jo = F({
	title: B(O().nullish(), () => void 0),
	description: B(O().nullish(), () => void 0),
	minItems: A().nullish(),
	maxItems: A().nullish(),
	items: qo,
	default: B(H(O()).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Yo = ao(I([
	Vo.and(F({ type: z("string") })),
	Ho.and(F({ type: z("number") })),
	Uo.and(F({ type: z("integer") })),
	Wo.and(F({ type: z("boolean") })),
	Jo.and(F({ type: z("array") })),
	io(F({ type: O() }), "type", [
		"array",
		"boolean",
		"integer",
		"number",
		"string"
	])
]), "type", [
	"array",
	"boolean",
	"integer",
	"number",
	"string"
]), Xo = F({
	type: B(Ro.optional().default("object"), () => "object"),
	title: B(O().nullish(), () => void 0),
	properties: R(O(), Yo).optional().default({}),
	required: P(O()).nullish(),
	description: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Zo = L(I([Io, Lo]), F({ requestedSchema: Xo })), Qo = O(), $o = L(I([Io, Lo]), F({
	elicitationId: Qo,
	url: ra()
})), es = ao(L(I([
	Zo.and(F({ mode: z("form") })),
	$o.and(F({ mode: z("url") })),
	io(L(I([Io, Lo]), F({ mode: O() })), "mode", ["form", "url"])
]), F({
	message: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
})), "mode", ["form", "url"]), ts = O(), ns = F({
	serverId: ts,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), rs = O(), is = F({
	connectionId: rs,
	method: O(),
	params: R(O(), N()).nullish(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), as = F({
	connectionId: rs,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), os = N();
F({
	id: U,
	method: O(),
	params: I([
		oo,
		so,
		ko,
		jo,
		Mo,
		No,
		Po,
		Fo,
		es,
		ns,
		is,
		as,
		os
	]).nullish()
});
var ss = j().gte(0).lte(65535), cs = F({
	image: B(M().optional().default(!1), () => !1),
	audio: B(M().optional().default(!1), () => !1),
	embeddedContext: B(M().optional().default(!1), () => !1),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ls = F({
	http: B(M().optional().default(!1), () => !1),
	sse: B(M().optional().default(!1), () => !1),
	acp: B(M().optional().default(!1), () => !1),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), us = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ds = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), fs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ps = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ms = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), hs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), gs = F({
	list: B(us.nullish(), () => void 0),
	delete: B(ds.nullish(), () => void 0),
	additionalDirectories: B(fs.nullish(), () => void 0),
	fork: B(ps.nullish(), () => void 0),
	resume: B(ms.nullish(), () => void 0),
	close: B(hs.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), _s = F({
	logout: B(F({ _meta: B(R(O(), N()).nullish(), () => void 0) }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), vs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ys = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), bs = F({
	syncKind: I([z("full"), z("incremental")]),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), xs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Ss = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Cs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ws = F({
	document: B(F({
		didOpen: B(ys.nullish(), () => void 0),
		didChange: B(bs.nullish(), () => void 0),
		didClose: B(xs.nullish(), () => void 0),
		didSave: B(Ss.nullish(), () => void 0),
		didFocus: B(Cs.nullish(), () => void 0),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	}).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ts = F({
	maxCount: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Es = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Ds = F({
	maxCount: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Os = F({
	maxCount: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ks = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), As = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), js = F({
	recentFiles: B(Ts.nullish(), () => void 0),
	relatedSnippets: B(Es.nullish(), () => void 0),
	editHistory: B(Ds.nullish(), () => void 0),
	userActions: B(Os.nullish(), () => void 0),
	openFiles: B(ks.nullish(), () => void 0),
	diagnostics: B(As.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ms = F({
	events: B(ws.nullish(), () => void 0),
	context: B(js.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ns = I([
	z("utf-16"),
	z("utf-32"),
	z("utf-8")
]), Ps = F({
	loadSession: B(M().optional().default(!1), () => !1),
	promptCapabilities: B(cs.optional().default({
		image: !1,
		audio: !1,
		embeddedContext: !1
	}), () => ({
		image: !1,
		audio: !1,
		embeddedContext: !1
	})),
	mcpCapabilities: B(ls.optional().default({
		http: !1,
		sse: !1,
		acp: !1
	}), () => ({
		http: !1,
		sse: !1,
		acp: !1
	})),
	sessionCapabilities: B(gs.optional().default({}), () => ({})),
	auth: B(_s.optional().default({}), () => ({})),
	providers: B(vs.nullish(), () => void 0),
	nes: B(Ms.nullish(), () => void 0),
	positionEncoding: B(Ns.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Fs = O(), Is = F({
	id: Fs,
	name: O(),
	description: B(O().nullish(), () => void 0),
	args: B(H(O()).optional(), () => []),
	env: B(R(O(), O()).optional(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ls = F({
	id: Fs,
	name: O(),
	description: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Rs = I([Is.and(F({ type: z("terminal") })), Ls]), zs = F({
	name: O(),
	title: B(O().nullish(), () => void 0),
	version: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Bs = F({
	protocolVersion: ss,
	agentCapabilities: B(Ps.optional().default({
		loadSession: !1,
		promptCapabilities: {
			image: !1,
			audio: !1,
			embeddedContext: !1
		},
		mcpCapabilities: {
			http: !1,
			sse: !1,
			acp: !1
		},
		sessionCapabilities: {},
		auth: {}
	}), () => ({
		loadSession: !1,
		promptCapabilities: {
			image: !1,
			audio: !1,
			embeddedContext: !1
		},
		mcpCapabilities: {
			http: !1,
			sse: !1,
			acp: !1
		},
		sessionCapabilities: {},
		auth: {}
	})),
	authMethods: B(H(Rs).optional().default([]), () => []),
	agentInfo: B(zs.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Vs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Hs = O(), Us = I([
	z("anthropic"),
	z("openai"),
	z("azure"),
	z("vertex"),
	z("bedrock"),
	O()
]), Ws = F({
	apiType: Us,
	baseUrl: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Gs = F({
	providers: P(F({
		providerId: Hs,
		supported: V(H(Us), () => []),
		required: M(),
		current: Ws.nullish(),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	})),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ks = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), qs = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Js = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Ys = O(), Xs = F({
	currentModeId: Ys,
	availableModes: V(H(F({
		id: Ys,
		name: O(),
		description: B(O().nullish(), () => void 0),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	})), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Zs = O(), Qs = I([
	z("mode"),
	z("model"),
	z("model_config"),
	z("thought_level"),
	O()
]), $s = O(), ec = F({
	value: $s,
	name: O(),
	description: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), tc = F({
	group: O(),
	name: O(),
	options: V(H(ec), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), nc = F({
	currentValue: $s,
	options: I([P(ec), P(tc)])
}), rc = F({ currentValue: M() }), ic = L(I([nc.and(F({ type: z("select") })), rc.and(F({ type: z("boolean") }))]), F({
	id: Zs,
	name: O(),
	description: B(O().nullish(), () => void 0),
	category: B(Qs.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
})), ac = F({
	sessionId: W,
	modes: B(Xs.nullish(), () => void 0),
	configOptions: B(H(ic).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), oc = F({
	modes: B(Xs.nullish(), () => void 0),
	configOptions: B(H(ic).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), sc = F({
	sessions: V(H(F({
		sessionId: W,
		cwd: O(),
		additionalDirectories: B(H(O()).optional(), () => []),
		title: B(O().nullish(), () => void 0),
		updatedAt: B(O().nullish(), () => void 0),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	})), () => []),
	nextCursor: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), cc = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), lc = F({
	sessionId: W,
	modes: B(Xs.nullish(), () => void 0),
	configOptions: B(H(ic).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), uc = F({
	modes: B(Xs.nullish(), () => void 0),
	configOptions: B(H(ic).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), dc = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), fc = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), pc = F({
	configOptions: V(H(ic), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), mc = F({
	stopReason: I([
		z("end_turn"),
		z("max_tokens"),
		z("max_turn_requests"),
		z("refusal"),
		z("cancelled")
	]),
	usage: B(F({
		totalTokens: A(),
		inputTokens: A(),
		outputTokens: A(),
		thoughtTokens: B(A().nullish(), () => void 0),
		cachedReadTokens: B(A().nullish(), () => void 0),
		cachedWriteTokens: B(A().nullish(), () => void 0),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	}).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), hc = F({
	sessionId: W,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), gc = O(), G = F({
	line: j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	character: j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), _c = F({
	start: G,
	end: G,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), vc = F({
	range: _c,
	newText: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), yc = F({
	id: gc,
	uri: O(),
	edits: P(vc),
	cursorPosition: B(G.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), bc = F({
	id: gc,
	uri: O(),
	position: G,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), xc = F({
	id: gc,
	uri: O(),
	position: G,
	newName: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Sc = F({
	id: gc,
	uri: O(),
	search: O(),
	replace: O(),
	isRegex: M().nullish(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Cc = F({
	suggestions: P(I([
		yc.and(F({ kind: z("edit") })),
		bc.and(F({ kind: z("jump") })),
		xc.and(F({ kind: z("rename") })),
		Sc.and(F({ kind: z("searchAndReplace") }))
	])),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), wc = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Tc = N(), Ec = N(), Dc = F({
	code: I([
		z(-32700),
		z(-32600),
		z(-32601),
		z(-32602),
		z(-32603),
		z(-32800),
		z(-32e3),
		z(-32002),
		j().min(-2147483648, { error: "Invalid value: Expected int32 to be >= -2147483648" }).max(2147483647, { error: "Invalid value: Expected int32 to be <= 2147483647" })
	]),
	message: O(),
	data: B(N().optional(), () => void 0)
});
I([F({
	id: U,
	result: I([
		Bs,
		Vs,
		Gs,
		Ks,
		qs,
		Js,
		ac,
		oc,
		sc,
		cc,
		lc,
		uc,
		dc,
		fc,
		pc,
		mc,
		hc,
		Cc,
		wc,
		Tc,
		Ec
	])
}), F({
	id: U,
	error: Dc
})]);
var Oc = F({
	content: yo,
	messageId: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), kc = F({
	toolCallId: co,
	title: O(),
	name: B(O().nullish(), () => void 0),
	kind: B(lo.optional(), () => void 0),
	status: B(uo.optional(), () => void 0),
	content: B(H(wo).optional(), () => []),
	locations: B(H(To).optional(), () => []),
	rawInput: B(N().optional(), () => void 0),
	rawOutput: B(N().optional(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ac = I([
	z("high"),
	z("medium"),
	z("low")
]), jc = I([
	z("pending"),
	z("in_progress"),
	z("completed")
]), Mc = F({
	content: O(),
	priority: Ac,
	status: jc,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Nc = F({
	entries: V(H(Mc), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Pc = O(), Fc = F({
	planId: Pc,
	entries: V(H(Mc), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ic = F({
	planId: Pc,
	uri: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Lc = F({
	planId: Pc,
	content: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Rc = F({
	plan: I([
		Fc.and(F({ type: z("items") })),
		Ic.and(F({ type: z("file") })),
		Lc.and(F({ type: z("markdown") }))
	]),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), zc = F({
	planId: Pc,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Bc = F({
	hint: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Vc = F({
	availableCommands: V(H(F({
		name: O(),
		description: O(),
		input: B(Bc.nullish(), () => void 0),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	})), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Hc = F({
	currentModeId: Ys,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Uc = F({
	configOptions: V(H(ic), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Wc = F({
	title: B(O().nullish(), () => void 0),
	updatedAt: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Gc = F({
	amount: A(),
	currency: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Kc = F({
	used: A(),
	size: A(),
	cost: B(Gc.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), qc = O(), Jc = F({
	compactionId: qc,
	status: I([
		z("in_progress"),
		z("completed"),
		z("failed"),
		z("cancelled"),
		O()
	]),
	summary: B(H(yo).nullish(), () => void 0),
	error: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Yc = F({
	compactionId: qc,
	content: yo,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Xc = F({
	sessionId: W,
	update: I([
		Oc.and(F({ sessionUpdate: z("user_message_chunk") })),
		Oc.and(F({ sessionUpdate: z("agent_message_chunk") })),
		Oc.and(F({ sessionUpdate: z("agent_thought_chunk") })),
		kc.and(F({ sessionUpdate: z("tool_call") })),
		Eo.and(F({ sessionUpdate: z("tool_call_update") })),
		Nc.and(F({ sessionUpdate: z("plan") })),
		Rc.and(F({ sessionUpdate: z("plan_update") })),
		zc.and(F({ sessionUpdate: z("plan_removed") })),
		Vc.and(F({ sessionUpdate: z("available_commands_update") })),
		Hc.and(F({ sessionUpdate: z("current_mode_update") })),
		Uc.and(F({ sessionUpdate: z("config_option_update") })),
		Wc.and(F({ sessionUpdate: z("session_info_update") })),
		Kc.and(F({ sessionUpdate: z("usage_update") })),
		Jc.and(F({ sessionUpdate: z("compaction_update") })),
		Yc.and(F({ sessionUpdate: z("compaction_summary_chunk") }))
	]),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Zc = F({
	elicitationId: Qo,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Qc = F({
	connectionId: rs,
	method: O(),
	params: B(R(O(), N()).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), $c = N();
F({
	method: O(),
	params: I([
		Xc,
		Zc,
		Qc,
		$c
	]).nullish()
});
var el = F({
	readTextFile: B(M().optional().default(!1), () => !1),
	writeTextFile: B(M().optional().default(!1), () => !1),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), tl = R(O(), N()), nl = F({
	boolean: B(F({ _meta: B(R(O(), N()).nullish(), () => void 0) }).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), rl = F({
	compaction: B(tl.nullish(), () => void 0),
	configOptions: B(nl.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), il = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), al = F({
	terminal: B(M().optional().default(!1), () => !1),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ol = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), sl = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), cl = F({
	form: B(ol.nullish(), () => void 0),
	url: B(sl.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ll = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ul = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), dl = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), fl = F({
	jump: B(ll.nullish(), () => void 0),
	rename: B(ul.nullish(), () => void 0),
	searchAndReplace: B(dl.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), pl = F({
	protocolVersion: ss,
	clientCapabilities: B(F({
		fs: B(el.optional().default({
			readTextFile: !1,
			writeTextFile: !1
		}), () => ({
			readTextFile: !1,
			writeTextFile: !1
		})),
		terminal: B(M().optional().default(!1), () => !1),
		session: B(rl.nullish(), () => void 0),
		plan: B(il.nullish(), () => void 0),
		auth: B(al.optional().default({ terminal: !1 }), () => ({ terminal: !1 })),
		elicitation: B(cl.nullish(), () => void 0),
		nes: B(fl.nullish(), () => void 0),
		positionEncodings: B(H(Ns).optional(), () => []),
		_meta: B(R(O(), N()).nullish(), () => void 0)
	}).optional().default({
		fs: {
			readTextFile: !1,
			writeTextFile: !1
		},
		terminal: !1,
		auth: { terminal: !1 }
	}), () => ({
		fs: {
			readTextFile: !1,
			writeTextFile: !1
		},
		terminal: !1,
		auth: { terminal: !1 }
	})),
	clientInfo: B(zs.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ml = F({
	methodId: Fs,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), hl = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), gl = F({
	providerId: Hs,
	apiType: Us,
	baseUrl: O(),
	headers: R(O(), O()).optional(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), _l = F({
	providerId: Hs,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), vl = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), yl = F({
	name: O(),
	value: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), bl = F({
	name: O(),
	url: O(),
	headers: P(yl),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), xl = F({
	name: O(),
	url: O(),
	headers: P(yl),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Sl = F({
	name: O(),
	serverId: ts,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Cl = F({
	name: O(),
	command: O(),
	args: P(O()),
	env: P(Ao),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), wl = I([
	bl.and(F({ type: z("http") })),
	xl.and(F({ type: z("sse") })),
	Sl.and(F({ type: z("acp") })),
	Cl
]), Tl = F({
	cwd: O(),
	additionalDirectories: B(H(O()).optional(), () => []),
	mcpServers: V(H(wl), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), El = F({
	mcpServers: V(H(wl), () => []),
	cwd: O(),
	additionalDirectories: B(H(O()).optional(), () => []),
	sessionId: W,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Dl = F({
	cwd: O().nullish(),
	cursor: O().nullish(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ol = F({
	sessionId: W,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), kl = F({
	sessionId: W,
	cwd: O(),
	additionalDirectories: B(H(O()).optional(), () => []),
	mcpServers: B(H(wl).optional(), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Al = F({
	sessionId: W,
	cwd: O(),
	additionalDirectories: B(H(O()).optional(), () => []),
	mcpServers: B(H(wl).optional(), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), jl = F({
	sessionId: W,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ml = F({
	sessionId: W,
	modeId: Ys,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Nl = L(I([F({
	value: M(),
	type: z("boolean")
}), F({ value: $s })]), F({
	sessionId: W,
	configId: Zs,
	_meta: B(R(O(), N()).nullish(), () => void 0)
})), Pl = F({
	sessionId: W,
	prompt: P(yo),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Fl = F({
	uri: O(),
	name: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Il = F({
	name: O(),
	owner: O(),
	remoteUrl: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ll = F({
	workspaceUri: B(O().nullish(), () => void 0),
	workspaceFolders: P(Fl).nullish(),
	repository: B(Il.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Rl = I([
	z("automatic"),
	z("diagnostic"),
	z("manual")
]), zl = F({
	uri: O(),
	languageId: O(),
	text: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Bl = F({
	startLine: j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	endLine: j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	text: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Vl = F({
	uri: O(),
	excerpts: P(Bl),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Hl = F({
	uri: O(),
	diff: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ul = F({
	action: O(),
	uri: O(),
	position: G,
	timestampMs: A(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Wl = F({
	uri: O(),
	languageId: O(),
	visibleRange: B(_c.nullish(), () => void 0),
	lastFocusedMs: B(A().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Gl = I([
	z("error"),
	z("warning"),
	z("information"),
	z("hint")
]), Kl = F({
	uri: O(),
	range: _c,
	severity: Gl,
	message: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ql = F({
	recentFiles: P(zl).nullish(),
	relatedSnippets: P(Vl).nullish(),
	editHistory: P(Hl).nullish(),
	userActions: P(Ul).nullish(),
	openFiles: P(Wl).nullish(),
	diagnostics: P(Kl).nullish(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Jl = F({
	sessionId: W,
	uri: O(),
	version: A(),
	position: G,
	selection: _c.nullish(),
	triggerKind: Rl,
	context: ql.nullish(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Yl = F({
	sessionId: W,
	_meta: B(R(O(), N()).nullish(), () => void 0)
});
F({
	id: U,
	method: O(),
	params: I([
		pl,
		ml,
		hl,
		gl,
		_l,
		vl,
		Tl,
		El,
		Dl,
		Ol,
		kl,
		Al,
		jl,
		Ml,
		Nl,
		Pl,
		Ll,
		Jl,
		Yl,
		is,
		os
	]).nullish()
});
var Xl = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), Zl = F({
	content: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), Ql = F({
	optionId: Do,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), $l = F({
	outcome: I([F({ outcome: z("cancelled") }), Ql.and(F({ outcome: z("selected") }))]),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), eu = F({
	terminalId: So,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), tu = F({
	exitCode: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	signal: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), nu = F({
	output: O(),
	truncated: M(),
	exitStatus: B(tu.nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), ru = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), iu = F({
	exitCode: B(j().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	signal: B(O().nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), au = F({ _meta: B(R(O(), N()).nullish(), () => void 0) }), ou = I([
	O(),
	A(),
	A(),
	M(),
	P(O())
]), su = F({ content: R(O(), ou).nullish() });
I([F({
	id: U,
	result: I([
		Xl,
		Zl,
		$l,
		eu,
		nu,
		ru,
		iu,
		au,
		ao(L(I([
			su.and(F({ action: z("accept") })),
			F({ action: z("decline") }),
			F({ action: z("cancel") }),
			io(F({ action: O() }), "action", [
				"accept",
				"cancel",
				"decline"
			])
		]), F({ _meta: B(R(O(), N()).nullish(), () => void 0) })), "action", [
			"accept",
			"cancel",
			"decline"
		]),
		F({
			connectionId: rs,
			_meta: B(R(O(), N()).nullish(), () => void 0)
		}),
		F({ _meta: B(R(O(), N()).nullish(), () => void 0) }),
		Ec,
		Tc
	])
}), F({
	id: U,
	error: Dc
})]);
var cu = F({
	sessionId: W,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), lu = F({
	sessionId: W,
	uri: O(),
	languageId: O(),
	version: A(),
	text: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), uu = F({
	range: _c.nullish(),
	text: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), du = F({
	sessionId: W,
	uri: O(),
	version: A(),
	contentChanges: V(H(uu), () => []),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), fu = F({
	sessionId: W,
	uri: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), pu = F({
	sessionId: W,
	uri: O(),
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), mu = F({
	sessionId: W,
	uri: O(),
	version: A(),
	position: G,
	visibleRange: _c,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), hu = F({
	sessionId: W,
	id: gc,
	_meta: B(R(O(), N()).nullish(), () => void 0)
}), gu = F({
	sessionId: W,
	id: gc,
	reason: B(I([
		z("rejected"),
		z("ignored"),
		z("replaced"),
		z("cancelled")
	]).nullish(), () => void 0),
	_meta: B(R(O(), N()).nullish(), () => void 0)
});
F({
	method: O(),
	params: I([
		cu,
		lu,
		du,
		fu,
		pu,
		mu,
		hu,
		gu,
		Qc,
		$c
	]).nullish()
}), F({
	requestId: U,
	_meta: B(R(O(), N()).nullish(), () => void 0)
});
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/jsonrpc.js
var _u = "$/cancel_request";
function vu(e) {
	return xu(e) && "id" in e && typeof e.method == "string" && Su(e.id);
}
function yu(e) {
	if (!xu(e) || "method" in e || !("id" in e) || !Su(e.id)) return !1;
	let t = Object.hasOwn(e, "result"), n = Object.hasOwn(e, "error");
	return t === n ? !1 : !n || Eu(e.error);
}
function bu(e) {
	return xu(e) && !("id" in e) && typeof e.method == "string";
}
function K(e) {
	return typeof e == "object" && !!e;
}
function xu(e) {
	return K(e) && e.jsonrpc === "2.0";
}
function Su(e) {
	return e === null || typeof e == "string" || typeof e == "number" && Number.isFinite(e);
}
function Cu(e) {
	return K(e) && !("method" in e) && ("id" in e || "result" in e || "error" in e);
}
function wu(e) {
	let t = !1, n = !1, r = !1, i = !1;
	for (let a of e) t ||= vu(a) || bu(a), n ||= yu(a), K(a) && (r ||= "method" in a, i ||= "result" in a || "error" in a);
	return t ? !1 : n ? !0 : i && !r;
}
function Tu(e) {
	if (!(!K(e) || !Su(e.requestId))) return e.requestId;
}
function Eu(e) {
	return K(e) && typeof e.code == "number" && Number.isInteger(e.code) && typeof e.message == "string";
}
var q = {
	yes() {
		return { handled: !0 };
	},
	no(e, t = !1) {
		return {
			handled: !1,
			message: e,
			retry: t
		};
	}
};
function J(e) {
	let t = Promise.reject(e);
	return t.catch(() => {}), t;
}
function Du(e) {
	if (e instanceof Error || typeof e == "object" && e && "message" in e && typeof e.message == "string") return e.message;
}
function Ou(e) {
	return typeof e == "object" && !!e && "name" in e && e.name === "ZodError" && "issues" in e && Array.isArray(e.issues) && "format" in e && typeof e.format == "function";
}
function ku(e) {
	if (e instanceof Y) return e.toResult();
	if (Ou(e)) return Y.invalidParams(e.format()).toResult();
	let t = Du(e);
	try {
		return Y.internalError(t ? JSON.parse(t) : {}).toResult();
	} catch {
		return Y.internalError({ details: t }).toResult();
	}
}
function Au(e) {
	return e instanceof Y && e.code === -32800 ? e : Y.requestCancelled(e);
}
function ju(e, t) {
	let n = Mu(e, t);
	return n ? n.toResult() : ku(e);
}
function Mu(e, t) {
	if (!(!t.aborted || !Nu(e))) return Au(t.reason);
}
function Nu(e) {
	if (typeof e != "object" || !e) return !1;
	let t = e;
	return t.name === "AbortError" || t.code === "ABORT_ERR";
}
var Pu = class {
	id;
	sendResult;
	signal;
	finishRequest;
	didRespond = !1;
	constructor(e, t, n = new AbortController().signal, r) {
		this.id = e, this.sendResult = t, this.signal = n, this.finishRequest = r;
	}
	get responded() {
		return this.didRespond;
	}
	respond(e) {
		return this.respondWithResult({ result: e ?? null });
	}
	respondWithError(e) {
		let t = e instanceof Y ? e.toErrorResponse() : e;
		return this.respondWithResult({ error: t });
	}
	respondWithResult(e) {
		return this.didRespond ? J(/* @__PURE__ */ Error("JSON-RPC request already responded")) : (this.didRespond = !0, this.sendResult(e).finally(() => {
			this.finishRequest?.();
		}));
	}
}, Fu = /* @__PURE__ */ new WeakMap(), Iu = class {
	disposeHandler;
	active = !0;
	constructor(e) {
		this.disposeHandler = e;
	}
	dispose() {
		this.active && (this.active = !1, this.disposeHandler());
	}
	[Symbol.dispose]() {
		this.dispose();
	}
	runIndefinitely() {
		return this;
	}
}, Lu = class {
	connection;
	constructor(e) {
		this.connection = e;
	}
	sendRequest(e, t, n, r) {
		return this.connection.sendRequest(e, t, n, r);
	}
	sendNotification(e, t) {
		return this.connection.sendNotification(e, t);
	}
	sendBatch(e) {
		return this.connection.sendBatch(e);
	}
	sendCancelRequest(e) {
		return this.connection.sendCancelRequest(e);
	}
	addDynamicHandler(e) {
		return this.connection.addDynamicHandler(e);
	}
	get signal() {
		return this.connection.signal;
	}
	get closed() {
		return this.connection.closed;
	}
}, Ru = class {
	pendingResponses = /* @__PURE__ */ new Map();
	incomingRequests = /* @__PURE__ */ new Map();
	nextRequestId = 0;
	staticHandlers = [];
	dynamicHandlers = /* @__PURE__ */ new Set();
	stream;
	writeQueue = Promise.resolve();
	abortController = new AbortController();
	closedPromise;
	retryQueue = [];
	context = new Lu(this);
	receiveReader;
	allowBatches = !0;
	constructor(e, t, n, r) {
		if (typeof e == "function") {
			let i = e, a = t, o = n;
			this.initialize(o, [...r?.handlers ?? [], this.legacyHandler(i, a)], r);
			return;
		}
		let i = e, a = t, o = n;
		this.initialize(i, [...o?.handlers ?? [], ...a], o);
	}
	static builder() {
		return new zu();
	}
	runUntil(e) {
		let t = !1, n = Promise.resolve().then(() => e(this.context)).finally(() => {
			t = !0;
		}), r = this.closed.then(() => {
			if (t) return new Promise(() => {});
			throw this.closedReason();
		});
		return Promise.race([n, r]).finally(() => {
			t = !0, this.close();
		});
	}
	addDynamicHandler(e) {
		if (this.dynamicHandlers.add(e), this.retryQueue.length > 0) for (let e of this.retryQueue.splice(0)) this.processIncomingMessage(e).catch((e) => this.close(e));
		return new Iu(() => {
			this.dynamicHandlers.delete(e);
		});
	}
	get signal() {
		return this.abortController.signal;
	}
	get closed() {
		return this.closedPromise;
	}
	getContext() {
		return this.context;
	}
	sendRequest(e, t, n, r = {}) {
		if (this.abortController.signal.aborted) return J(this.closedReason());
		let i = this.prepareRequest(e, t, n, r);
		return this.sendWireMessage(i.message).catch(() => {}), r.cancellationSignal?.aborted && i.cancel(), i.response;
	}
	sendBatch(e) {
		if (this.abortController.signal.aborted) return J(this.closedReason());
		if (!this.allowBatches) return J(/* @__PURE__ */ TypeError("JSON-RPC batches are not supported on this connection"));
		if (e.length === 0) return J(/* @__PURE__ */ TypeError("JSON-RPC batch must contain at least one entry"));
		let t = [], n = [], r = [];
		for (let i of e) {
			if (i.kind === "notification") {
				t.push({
					jsonrpc: "2.0",
					method: i.method,
					params: i.params
				}), r.push(Promise.resolve(void 0));
				continue;
			}
			let e = this.prepareRequest(i.method, i.params, i.mapResponse, i.options);
			t.push(e.message), r.push(e.response), n.push({
				signal: i.options?.cancellationSignal,
				cancel: e.cancel
			});
		}
		let i = t, a = this.sendWireMessage(i);
		for (let e of n) e.signal?.aborted && e.cancel();
		let o = Promise.all([a, ...r]).then(([, ...e]) => e);
		return o.catch(() => {}), o;
	}
	sendCancelRequest(e) {
		return this.sendNotification(_u, { requestId: e });
	}
	sendNotification(e, t) {
		return this.abortController.signal.aborted ? J(this.closedReason()) : this.sendWireMessage({
			jsonrpc: "2.0",
			method: e,
			params: t
		});
	}
	prepareRequest(e, t, n, r = {}) {
		let i = this.nextRequestId++, a = () => {}, o = new Promise((e, t) => {
			let o = {
				resolve: (r) => {
					try {
						e(n ? n(r) : r);
					} catch (e) {
						t(e);
					}
				},
				reject: t
			};
			a = () => {
				o.cancellationSent || (o.cancellationSent = !0, o.cleanup?.(), this.sendCancelRequest(i).catch(() => {}));
			}, r.cancellationSignal?.addEventListener("abort", a, { once: !0 }), o.cleanup = () => {
				r.cancellationSignal?.removeEventListener("abort", a);
			}, this.pendingResponses.set(i, o);
		});
		return o.catch(() => {}), {
			message: {
				jsonrpc: "2.0",
				id: i,
				method: e,
				params: t
			},
			response: o,
			cancel: () => a()
		};
	}
	close(e) {
		if (this.abortController.signal.aborted) return;
		let t = e ?? /* @__PURE__ */ Error("ACP connection closed");
		this.abortController.abort(t);
		for (let e of this.pendingResponses.values()) e.cleanup?.(), e.reject(t);
		this.pendingResponses.clear();
		for (let e of this.incomingRequests.values()) e.abort(t);
		this.incomingRequests.clear(), this.receiveReader?.cancel(t).catch(() => {});
	}
	initialize(e, t, n) {
		this.stream = e, this.staticHandlers = t, this.allowBatches = n?.allowBatches ?? !0, this.closedPromise = new Promise((e) => {
			this.abortController.signal.addEventListener("abort", () => e());
		}), this.receive();
	}
	legacyHandler(e, t) {
		return { handleMessage: async (n, r) => {
			if (n.kind === "request") {
				let t = await e(n.method, n.params, r);
				await n.responder.respond(t);
			} else await t(n.method, n.params, r);
			return q.yes();
		} };
	}
	async receive() {
		let e;
		try {
			let e = this.stream.readable.getReader();
			this.receiveReader = e;
			try {
				for (; !this.abortController.signal.aborted;) {
					let { value: t, done: n } = await e.read();
					if (this.abortController.signal.aborted || n) break;
					this.receiveWireMessage(t);
				}
			} finally {
				this.receiveReader === e && (this.receiveReader = void 0), e.releaseLock();
			}
		} catch (t) {
			e = t;
		} finally {
			this.close(e);
		}
	}
	receiveWireMessage(e) {
		if (Array.isArray(e)) {
			if (!this.allowBatches) {
				this.close(/* @__PURE__ */ TypeError("JSON-RPC batches are not supported on this connection"));
				return;
			}
			this.receiveBatch(e);
			return;
		}
		if (!vu(e) && !bu(e) && !Cu(e)) {
			this.sendWireMessage(Bu(Y.invalidRequest(e))).catch(() => {});
			return;
		}
		this.receiveMessage(e);
	}
	receiveBatch(e) {
		if (e.length === 0) {
			this.sendWireMessage(Bu(Y.invalidRequest(e))).catch(() => {});
			return;
		}
		let t = wu(e), n = t ? 0 : e.reduce((e, t) => e + +!bu(t), 0), r = e.reduce((e, t) => e + +!!bu(t), 0), i = !1, a = [], o = async () => {
			i || n !== 0 || r !== 0 || a.length === 0 || (i = !0, await this.sendWireMessage(a));
		}, s = async (e) => {
			a.push(e), --n, await o();
		};
		for (let n of e) {
			if (t) {
				Cu(n) && this.receiveMessage(n);
				continue;
			}
			if (!vu(n) && !bu(n)) {
				s(Bu(Y.invalidRequest(n))).catch(() => {});
				continue;
			}
			let i = this.receiveMessage(n, vu(n) ? s : void 0, e.length);
			bu(n) && i.finally(() => {
				--r, o().catch((e) => this.close(e));
			});
		}
	}
	receiveMessage(e, t, n) {
		return this.abortController.signal.aborted ? Promise.resolve() : K(e) ? "method" in e ? ("id" in e || this.handleProtocolNotification(e), this.processIncomingMessage(this.toIncomingMessage(e, t, n)).catch((e) => this.close(e))) : ("id" in e ? this.handleResponse(e) : console.error("Invalid message", { message: e }), Promise.resolve()) : (console.error("Invalid message", { message: e }), Promise.resolve());
	}
	async processIncomingMessage(e) {
		if (this.abortController.signal.aborted) return;
		let t = e, n = !1;
		try {
			for (let e of [...this.staticHandlers, ...this.dynamicHandlers.values()]) {
				if (this.abortController.signal.aborted) return;
				let r = await e.handleMessage(t, this.context) ?? { handled: !0 };
				if (r.handled) return;
				t = r.message ?? t, n ||= !!r.retry;
			}
			n ? this.retryQueue.push(t) : t.kind === "request" && await t.responder.respondWithError(Y.methodNotFound(t.method));
		} catch (n) {
			if (this.abortController.signal.aborted) return;
			if (t.kind === "request" && !t.responder.responded) await t.responder.respondWithResult(ju(n, t.responder.signal));
			else {
				let t = ku(n);
				"error" in t && console.error("Error handling notification", e.raw, t.error);
			}
		}
	}
	toIncomingMessage(e, t, n) {
		if ("id" in e) {
			let r = new AbortController();
			this.incomingRequests.set(e.id, r);
			let i = new Pu(e.id, (n) => {
				let r = {
					jsonrpc: "2.0",
					id: e.id,
					...n
				};
				return t ? t(r) : this.sendWireMessage(r);
			}, r.signal, () => {
				this.incomingRequests.get(e.id) === r && this.incomingRequests.delete(e.id);
			});
			return n !== void 0 && Fu.set(i, n), {
				kind: "request",
				method: e.method,
				params: e.params,
				raw: e,
				signal: r.signal,
				responder: i
			};
		}
		return {
			kind: "notification",
			method: e.method,
			params: e.params,
			raw: e
		};
	}
	handleResponse(e) {
		let t = this.pendingResponses.get(e.id);
		if (t) {
			if (this.pendingResponses.delete(e.id), t.cleanup?.(), !yu(e)) t.reject(Y.invalidRequest(e));
			else if ("result" in e) t.resolve(e.result);
			else {
				let { code: n, message: r, data: i } = e.error;
				t.reject(new Y(n, r, i));
			}
		} else console.error("Got response to unknown request", e.id);
	}
	handleProtocolNotification(e) {
		if (e.method !== _u) return;
		let t = Tu(e.params);
		if (t === void 0) return;
		let n = this.incomingRequests.get(t);
		!n || n.signal.aborted || n.abort(Y.requestCancelled({ requestId: t }));
	}
	closedReason() {
		return this.abortController.signal.reason ?? /* @__PURE__ */ Error("ACP connection closed");
	}
	async sendWireMessage(e) {
		return this.abortController.signal.aborted ? J(this.closedReason()) : (this.writeQueue = this.writeQueue.then(async () => {
			if (this.abortController.signal.aborted) throw this.closedReason();
			let t = this.stream.writable.getWriter();
			try {
				await t.write(e);
			} finally {
				t.releaseLock();
			}
		}).catch((e) => {
			throw this.close(e), e;
		}), this.writeQueue);
	}
}, zu = class {
	handlers = [];
	connectionName;
	name(e) {
		return this.connectionName = e, this;
	}
	withHandler(e) {
		return this.handlers.push(e), this;
	}
	onReceiveMessage(e) {
		return this.withHandler({
			handleMessage: async (t, n) => await e(t, n) ?? q.no(t),
			describe: () => this.connectionName ?? "onReceiveMessage"
		});
	}
	onReceiveRequest(e, t, n) {
		return this.withHandler({
			handleMessage: async (r, i) => r.kind !== "request" || r.method !== e ? q.no(r) : await n(t(r.params), r.responder, i) ?? q.yes(),
			describe: () => `${this.connectionName ?? "request"}:${e}`
		});
	}
	onReceiveNotification(e, t, n) {
		return this.withHandler({
			handleMessage: async (r, i) => r.kind !== "notification" || r.method !== e ? q.no(r) : await n(t(r.params), i) ?? q.yes(),
			describe: () => `${this.connectionName ?? "notification"}:${e}`
		});
	}
	connect(e, t) {
		return new Ru(e, this.handlers, t);
	}
	connectWith(e, t, n) {
		return this.connect(e, n).runUntil(t);
	}
}, Y = class e extends Error {
	code;
	data;
	constructor(e, t, n) {
		super(t), this.code = e, this.name = "RequestError", this.data = n;
	}
	static parseError(t, n) {
		return new e(-32700, `Parse error${n ? `: ${n}` : ""}`, t);
	}
	static invalidRequest(t, n) {
		return new e(-32600, `Invalid request${n ? `: ${n}` : ""}`, t);
	}
	static methodNotFound(t) {
		return new e(-32601, `"Method not found": ${t}`, { method: t });
	}
	static invalidParams(t, n) {
		return new e(-32602, `Invalid params${n ? `: ${n}` : ""}`, t);
	}
	static internalError(t, n) {
		return new e(-32603, `Internal error${n ? `: ${n}` : ""}`, t);
	}
	static requestCancelled(t, n) {
		return new e(-32800, `Request cancelled${n ? `: ${n}` : ""}`, t);
	}
	static authRequired(t, n) {
		return new e(-32e3, `Authentication required${n ? `: ${n}` : ""}`, t);
	}
	static resourceNotFound(t) {
		return new e(-32002, `Resource not found${t ? `: ${t}` : ""}`, t && { uri: t });
	}
	toResult() {
		return { error: {
			code: this.code,
			message: this.message,
			data: this.data
		} };
	}
	toErrorResponse() {
		return {
			code: this.code,
			message: this.message,
			data: this.data
		};
	}
};
function Bu(e) {
	return {
		jsonrpc: "2.0",
		id: null,
		error: e.toErrorResponse()
	};
}
//#endregion
//#region src/core/protocol/normalize.ts
var Vu = 1e3, Hu = 256, Uu = 16384, Wu = 256, Gu = 1048576, Ku = 8388608, qu = 1048576, Ju = 4096, Yu = 4194304, Xu = 4096, Zu = 16;
function X(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Z(e, t = Uu) {
	return typeof e == "string" ? yd(e, t) : void 0;
}
function Qu(e) {
	let t = Z(e, Uu);
	if (t) try {
		let e = new URL(t).protocol;
		return e === "http:" || e === "https:" ? t : void 0;
	} catch {
		return;
	}
}
function Q(e, t = Hu) {
	return Array.isArray(e) ? e.slice(0, t).filter(X) : [];
}
function $u(e) {
	return Array.isArray(e) ? e.slice(0, Wu).flatMap((e) => {
		let t = pd(e);
		return t ? [t] : [];
	}) : [];
}
function ed(e) {
	let t = _d(e, { nodes: Xu }, 0);
	return X(t) ? t : void 0;
}
function td(e) {
	return Q(e).map((e, t) => ({
		id: Z(e.methodId) ?? Z(e.id) ?? `auth-${t}`,
		name: Z(e.name) ?? Z(e.title) ?? `Authentication ${t + 1}`,
		...Z(e.description) ? { description: Z(e.description) } : {},
		type: Z(e.type) ?? "agent",
		raw: ed(e) ?? {}
	}));
}
function nd(e) {
	return Q(e).flatMap((e) => {
		let t = Z(e.name);
		if (!t) return [];
		let n = X(e.input) ? e.input : void 0;
		return [{
			name: t,
			description: Z(e.description) ?? "",
			...n && Z(n.hint) ? { inputHint: Z(n.hint) } : {}
		}];
	});
}
function rd(e) {
	return Q(e).flatMap((e) => {
		let t = Z(e.configId) ?? Z(e.id);
		if (!t) return [];
		let n = Z(e.type), r = e.currentValue, i = n === "boolean" || typeof r == "boolean" ? "boolean" : n === "select" || Array.isArray(e.options) ? "select" : "unknown", a = typeof r == "boolean" ? r : Z(r) ?? "", o = Q(e.options).flatMap((e) => {
			let t = Z(e.value);
			return t ? [{
				value: t,
				name: Z(e.name) ?? t,
				...Z(e.description) ? { description: Z(e.description) } : {}
			}] : [];
		});
		return [{
			id: t,
			name: Z(e.name) ?? t,
			...Z(e.description) ? { description: Z(e.description) } : {},
			...Z(e.category) ? { category: Z(e.category) } : {},
			type: i,
			currentValue: a,
			...o.length ? { options: o } : {}
		}];
	});
}
function id(e) {
	if (!X(e)) return [];
	let t = Q(e.availableModes), n = Z(e.currentModeId) ?? "";
	return t.length ? [{
		id: "mode",
		name: "Mode",
		category: "mode",
		type: "select",
		currentValue: n,
		options: t.flatMap((e) => {
			let t = Z(e.id);
			return t ? [{
				value: t,
				name: Z(e.name) ?? t,
				...Z(e.description) ? { description: Z(e.description) } : {}
			}] : [];
		})
	}] : [];
}
function ad(e) {
	if (!X(e)) return { sessions: [] };
	let t = Q(e.sessions).flatMap((e) => {
		let t = Z(e.sessionId);
		return t ? [{
			sessionId: t,
			...Z(e.title) ? { title: Z(e.title) } : {},
			...Z(e.updatedAt) ? { updatedAt: Z(e.updatedAt) } : {},
			...Z(e.cwd) ? { cwd: Z(e.cwd) } : {}
		}] : [];
	}), n = Z(e.nextCursor);
	return {
		sessions: t,
		...n ? { nextCursor: n } : {}
	};
}
function od(e) {
	if (!X(e) || !Sd(e.used) || !Sd(e.size)) return;
	let t = X(e.cost) ? Z(e.cost.currency) : void 0, n = X(e.cost) && Sd(e.cost.amount) && t !== void 0 ? {
		amount: e.cost.amount,
		currency: t
	} : void 0;
	return {
		used: e.used,
		size: e.size,
		...n ? { cost: n } : {}
	};
}
var sd = class {
	#e = [];
	#t = 0;
	#n = /* @__PURE__ */ new Map();
	#r;
	#i = /* @__PURE__ */ new Map();
	get activities() {
		return this.#e;
	}
	reset() {
		this.#e = [], this.#n.clear(), this.#r = void 0, this.#i.clear();
	}
	beginTurn() {
		this.#n.clear();
	}
	addUserMessage(e, t) {
		let n = `local-user-${++this.#t}`;
		return this.#h({
			type: "message",
			id: n,
			role: "user",
			content: $u(e),
			...t ? { pending: !0 } : {}
		}), t && (this.#r = n), n;
	}
	markUserAccepted() {
		this.#r && this.#p(this.#r, (e) => e.type === "message" ? {
			...e,
			pending: !1
		} : e);
	}
	reduce(e, t) {
		if (!X(e) || typeof e.sessionUpdate != "string") return { unsupported: "invalid_update" };
		let n = Z(e.sessionUpdate) ?? "";
		switch (n) {
			case "user_message_chunk":
			case "agent_message_chunk":
			case "agent_thought_chunk": {
				let r = n === "user_message_chunk" ? "user" : n === "agent_message_chunk" ? "assistant" : "thought";
				return this.#a(r, Z(e.messageId), e.content, t), {};
			}
			case "user_message":
			case "agent_message":
			case "agent_thought": {
				let t = n === "user_message" ? "user" : n === "agent_message" ? "assistant" : "thought";
				return this.#o(t, Z(e.messageId), e), {};
			}
			case "tool_call":
			case "tool_call_update": return this.#s(e), {};
			case "tool_call_content_chunk": return this.#c(e), {};
			case "plan":
			case "plan_update": return this.#l(e), {};
			case "plan_removed": return this.#m(`plan:${Z(e.planId) ?? "primary"}`), {};
			case "terminal_update": return this.#u(e), {};
			case "terminal_output_chunk": return this.#d(e), {};
			case "available_commands_update": return { commands: nd(e.availableCommands) };
			case "config_option_update": return { configOptions: rd(e.configOptions) };
			case "current_mode_update": return {};
			case "session_info_update": return { sessionTitle: Object.hasOwn(e, "title") ? Z(e.title) ?? null : void 0 };
			case "usage_update": return { usage: od(e) };
			case "state_update": {
				let t = Z(e.state);
				return t === "running" || t === "requires_action" || t === "idle" ? {
					state: t,
					...Z(e.stopReason) ? { stopReason: Z(e.stopReason) } : {}
				} : { unsupported: `state:${t ?? "missing"}` };
			}
			default: return { unsupported: n };
		}
	}
	#a(e, t, n, r) {
		let i = t;
		if (!i && r === 1 && (i = this.#n.get(e) ?? `v1-${e}-${++this.#t}`, this.#n.set(e, i)), !i) return;
		let a = cd(e, i);
		if (e === "user" && this.#r) {
			let e = this.#r, t = this.#e.find((t) => t.type === "message" && t.id === e);
			t?.type === "message" && (this.#p(e, () => ({
				...t,
				id: a,
				pending: !1
			})), this.#r = void 0);
		}
		let o = this.#e.find((e) => e.type === "message" && e.id === a), s = pd(n);
		s && (o?.type === "message" ? this.#p(a, () => ({
			...o,
			content: dd(o.content, s)
		})) : this.#h({
			type: "message",
			id: a,
			role: e,
			content: [s]
		}));
	}
	#o(e, t, n) {
		if (!t) return;
		let r = cd(e, t);
		if (e === "user" && this.#r) {
			let e = this.#r, t = this.#e.find((t) => t.type === "message" && t.id === e);
			if (t?.type === "message") {
				let i = Object.hasOwn(n, "content") ? $u(n.content) : t.content;
				this.#p(e, () => ({
					...t,
					id: r,
					content: i,
					pending: !1
				})), this.#r = void 0;
				return;
			}
		}
		let i = this.#e.find((e) => e.type === "message" && e.id === r), a = Object.hasOwn(n, "content") ? $u(n.content) : i?.type === "message" ? i.content : [];
		i?.type === "message" ? this.#p(r, () => ({
			...i,
			role: e,
			content: a
		})) : this.#h({
			type: "message",
			id: r,
			role: e,
			content: a
		});
	}
	#s(e) {
		let t = Z(e.toolCallId);
		if (!t) return;
		let n = `tool:${t}`, r = this.#e.find((e) => e.type === "tool" && e.id === n), { subagent: i, ...a } = r?.type === "tool" ? r : {
			type: "tool",
			id: n,
			title: "Tool",
			status: "pending",
			content: [],
			locations: []
		}, o = {
			...a,
			...Object.hasOwn(e, "title") ? { title: Z(e.title) ?? "Tool" } : {},
			...Object.hasOwn(e, "kind") && Z(e.kind) ? { kind: Z(e.kind) } : {},
			...Object.hasOwn(e, "status") ? { status: Z(e.status) ?? "pending" } : {},
			...Object.hasOwn(e, "content") ? { content: md(e.content) } : {},
			...Object.hasOwn(e, "locations") ? { locations: md(e.locations).filter(X) } : {},
			...Object.hasOwn(e, "rawInput") ? { rawInput: hd(e.rawInput) } : {},
			...Object.hasOwn(e, "rawOutput") ? { rawOutput: hd(e.rawOutput) } : {}
		}, s = ld(o), c = {
			...o,
			...s ? { subagent: s } : {}
		};
		this.#f(n, c);
	}
	#c(e) {
		let t = Z(e.toolCallId);
		if (!t || !Object.hasOwn(e, "content")) return;
		let n = `tool:${t}`, r = this.#e.find((e) => e.type === "tool" && e.id === n), i = r?.type === "tool" ? r : {
			type: "tool",
			id: n,
			title: "Tool",
			status: "pending",
			content: [],
			locations: []
		};
		i.content.length >= Hu || this.#f(n, {
			...i,
			content: md([...i.content, e.content])
		});
	}
	#l(e) {
		let t = X(e.plan) ? e.plan : e, n = `plan:${Z(t.planId) ?? "primary"}`, r = {
			type: "plan",
			id: n,
			entries: Q(t.entries).map((e) => ({
				content: Z(e.content) ?? "",
				...Z(e.priority) ? { priority: Z(e.priority) } : {},
				status: Z(e.status) ?? "pending"
			}))
		};
		this.#f(n, r);
	}
	#u(e) {
		let t = Z(e.terminalId);
		if (!t) return;
		let n = `terminal:${t}`;
		if (Object.hasOwn(e, "output") && X(e.output) && typeof e.output.data == "string") {
			let n = new TextDecoder(), r = fd(e.output.data).subarray(0, Yu), i = vd(n.decode(r, { stream: !0 }), qu);
			this.#i.set(t, {
				decoder: n,
				output: i,
				chunks: 1,
				decodedBytes: r.byteLength
			});
		}
		let r = this.#e.find((e) => e.type === "terminal" && e.id === n), i = Array.isArray(e.command) ? e.command.filter((e) => typeof e == "string").join(" ") : Z(e.command), a = this.#i.get(t)?.output ?? "", o = {
			type: "terminal",
			id: n,
			title: i ?? (r?.type === "terminal" ? r.title : "Terminal"),
			output: a,
			exited: Object.hasOwn(e, "exitStatus") ? e.exitStatus !== null : r?.type === "terminal" && r.exited
		};
		this.#f(n, o);
	}
	#d(e) {
		let t = Z(e.terminalId), n = Z(e.data);
		if (!t || !n) return;
		let r = this.#i.get(t) ?? {
			decoder: new TextDecoder(),
			output: "",
			chunks: 0,
			decodedBytes: 0
		};
		if (r.chunks >= Ju || r.decodedBytes >= Yu) return;
		let i = Yu - r.decodedBytes, a = fd(n).subarray(0, i);
		r.chunks += 1, r.decodedBytes += a.byteLength, r.output = vd(r.output + r.decoder.decode(a, { stream: !0 }), qu), this.#i.set(t, r);
		let o = `terminal:${t}`, s = this.#e.find((e) => e.type === "terminal" && e.id === o), c = s?.type === "terminal" ? {
			...s,
			output: r.output
		} : {
			type: "terminal",
			id: o,
			title: "Terminal",
			output: r.output,
			exited: !1
		};
		this.#f(o, c);
	}
	#f(e, t) {
		let n = this.#e.findIndex((t) => t.id === e);
		if (n < 0) {
			this.#h(t);
			return;
		}
		this.#e = this.#e.map((e, r) => r === n ? t : e);
	}
	#p(e, t) {
		this.#e = this.#e.map((n) => n.id === e ? t(n) : n);
	}
	#m(e) {
		this.#e = this.#e.filter((t) => t.id !== e);
	}
	#h(e) {
		if (this.#e = [...this.#e, e], this.#e.length <= Vu) return;
		let t = this.#e.slice(0, this.#e.length - Vu);
		this.#e = this.#e.slice(-1e3);
		for (let e of t) e.id === this.#r && (this.#r = void 0), e.type === "terminal" && this.#i.delete(e.id.slice(9));
	}
};
function cd(e, t) {
	return `message:${e}:${t}`;
}
function ld(e) {
	if (e.kind !== "think" || !X(e.rawInput)) return;
	let t = Z(e.rawInput.subagent_type), n = Z(e.rawInput.description), r = Z(e.rawInput.prompt);
	if (!t || !n || !r) return;
	let i = X(e.rawOutput) && X(e.rawOutput.metadata) ? e.rawOutput.metadata : void 0, a = ud(i?.sessionId), o = ud(e.rawInput.task_id), s = a ?? o, c = e.rawInput.background === !0 || i?.background === !0;
	return {
		agent: t,
		...n ? { description: n } : {},
		...s ? { sessionId: s } : {},
		background: c
	};
}
function ud(e) {
	return typeof e == "string" && e.length > 0 && e.length <= Uu ? e : void 0;
}
function dd(e, t) {
	let n = e.at(-1);
	return n?.type === "text" && typeof n.text == "string" && t.type === "text" && typeof t.text == "string" && n.annotations == null && n._meta == null && t.annotations == null && t._meta == null ? [...e.slice(0, -1), {
		type: "text",
		text: vd(n.text + t.text, Gu)
	}] : e.length >= Wu ? [...e] : [...e, t];
}
function fd(e) {
	try {
		if (typeof globalThis.atob == "function") {
			let t = globalThis.atob(e.slice(0, Ku));
			return Uint8Array.from(t, (e) => e.charCodeAt(0));
		}
		return new Uint8Array(Buffer.from(e.slice(0, Ku), "base64"));
	} catch {
		return /* @__PURE__ */ new Uint8Array();
	}
}
function pd(e) {
	if (!X(e)) return;
	let t = Z(e.type, 128);
	if (!t) return;
	let n = { type: t };
	if (t === "text") {
		let t = Z(e.text, Gu);
		return t === void 0 ? void 0 : {
			...n,
			type: "text",
			text: t
		};
	}
	if (t === "image" || t === "audio") {
		let r = Z(e.data, Ku), i = Z(e.mimeType, 256);
		return r === void 0 || i === void 0 ? void 0 : {
			...n,
			type: t,
			data: r,
			mimeType: i
		};
	}
	if (t === "resource_link") {
		let t = Cd(e.uri), r = Z(e.name, Uu);
		return !t || !r ? void 0 : {
			...n,
			type: "resource_link",
			uri: t,
			name: r,
			...Z(e.title) ? { title: Z(e.title) } : {},
			...Z(e.description) ? { description: Z(e.description) } : {},
			...Z(e.mimeType, 256) ? { mimeType: Z(e.mimeType, 256) } : {},
			...typeof e.size == "number" && Number.isFinite(e.size) ? { size: e.size } : {}
		};
	}
	if (t === "resource" && X(e.resource)) {
		let t = Cd(e.resource.uri);
		return t ? {
			...n,
			type: "resource",
			resource: {
				uri: t,
				...Z(e.resource.mimeType, 256) ? { mimeType: Z(e.resource.mimeType, 256) } : {},
				...Z(e.resource.text, 1048576) === void 0 ? {} : { text: Z(e.resource.text, Gu) },
				...Z(e.resource.blob, 8388608) === void 0 ? {} : { blob: Z(e.resource.blob, Ku) }
			}
		} : void 0;
	}
	return n;
}
function md(e) {
	if (!Array.isArray(e)) return [];
	let t = _d(e, { nodes: Xu }, 0);
	return Array.isArray(t) ? t : [];
}
function hd(e) {
	let t = _d(e, { nodes: Xu }, 0);
	return t === gd ? null : t;
}
var gd = Symbol("omit-structured-value");
function _d(e, t, n) {
	if (t.nodes <= 0 || n > Zu) return gd;
	if (--t.nodes, typeof e == "string") return yd(e, Gu);
	if (e === null || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e)) return e;
	if (Array.isArray(e)) {
		let r = [];
		for (let i of e.slice(0, Hu)) {
			let e = _d(i, t, n + 1);
			if (e !== gd && r.push(e), t.nodes <= 0) break;
		}
		return r;
	}
	if (X(e)) {
		let r = {};
		for (let [i, a] of Object.entries(e).slice(0, Hu)) {
			let e = _d(a, t, n + 1);
			if (e !== gd && (r[yd(i, Uu)] = e), t.nodes <= 0) break;
		}
		return r;
	}
	return null;
}
function vd(e, t) {
	if (e.length <= t) return e;
	let n = e.length - t;
	return xd(e.charCodeAt(n)) && (n += 1), e.slice(n);
}
function yd(e, t) {
	if (e.length <= t) return e;
	let n = t;
	return bd(e.charCodeAt(n - 1)) && --n, e.slice(0, n);
}
function bd(e) {
	return e >= 55296 && e <= 56319;
}
function xd(e) {
	return e >= 56320 && e <= 57343;
}
function Sd(e) {
	return typeof e == "number" && Number.isFinite(e) && e >= 0 && !Object.is(e, -0);
}
function Cd(e) {
	let t = Z(e, Uu);
	if (t) try {
		let e = new URL(t).protocol;
		return e === "http:" || e === "https:" || e === "file:" ? t : void 0;
	} catch {
		return;
	}
}
//#endregion
//#region src/core/protocol/interactions.ts
function wd(e) {
	return Q(e).map((e, t) => ({
		id: Z(e.optionId) ?? `option-${t}`,
		name: Z(e.name) ?? `Option ${t + 1}`,
		kind: Z(e.kind) ?? "unknown"
	}));
}
function Td(e) {
	let t = X(e) ? e : {}, n = t.mode === "form" || t.mode === "url" ? t.mode : "unknown", r = Z(t.elicitationId), i = ed(t.requestedSchema), a = Qu(t.url);
	return {
		type: "elicitation",
		...r ? { elicitationId: r } : {},
		mode: n,
		message: Z(t.message) ?? "The agent needs more information.",
		...a ? { url: a } : {},
		...i ? { requestedSchema: i } : {}
	};
}
function Ed(e) {
	return { outcome: e };
}
function Dd(e) {
	return e.action === "accept" ? {
		action: "accept",
		...e.content ? { content: Object.fromEntries(Object.entries(e.content).map(([e, t]) => [e, Array.isArray(t) ? [...t] : t])) } : {}
	} : { action: e.action };
}
//#endregion
//#region src/core/protocol/types.ts
function Od(e, t, n, r) {
	if (!Nd(e.cwd)) throw $(`ACP cwd must be an absolute path: ${e.cwd}`, n, r);
	if (e.additionalDirectories?.some((e) => !Nd(e))) throw $("ACP additionalDirectories must contain only absolute paths", n, r);
	if (e.additionalDirectories?.length && !t.additionalDirectories) throw $("The agent does not support additionalDirectories", n, r);
	if ((e.additionalDirectories?.length ?? 0) > 64) throw $("ACP additionalDirectories is limited to 64 entries", n, r);
	if ((e.mcpServers?.length ?? 0) > 32) throw $("ACP MCP configuration is limited to 32 servers", n, r);
	for (let i of e.mcpServers ?? []) Md(i, t, n, r);
}
function kd(e, t, n) {
	if (e.length > 256) throw $("ACP prompts are limited to 256 content blocks", n, "prompt");
	for (let r of e) if (jd(r, n), r.type !== "text" && r.type !== "resource_link" && !(r.type === "image" && t.image) && !(r.type === "audio" && t.audio) && !(r.type === "resource" && t.embeddedContext)) throw $(`The agent does not support prompt content type '${r.type}'`, n, "prompt");
}
async function Ad(t, n, r) {
	try {
		return await t();
	} catch (t) {
		throw t instanceof Error && "code" in t && t.code === -32e3 ? new e("AUTHENTICATION_REQUIRED", "The agent requires authentication for this session operation", {
			cause: t,
			protocol: n,
			phase: r
		}) : t;
	}
}
function jd(e, t) {
	if (e.type === "text" && typeof e.text == "string" && e.text.length > 1048576) throw $("ACP text content is limited to 1 MiB", t, "prompt");
	if ((e.type === "image" || e.type === "audio") && typeof e.data == "string" && e.data.length > 8388608) throw $("ACP media content is limited to 8 MiB of base64 data", t, "prompt");
	if (e.type === "resource" && typeof e.resource == "object" && e.resource !== null) {
		let n = e.resource;
		if (typeof n.text == "string" && n.text.length > 1048576) throw $("ACP embedded resource text is limited to 1 MiB", t, "prompt");
		if (typeof n.blob == "string" && n.blob.length > 8388608) throw $("ACP embedded resource data is limited to 8 MiB", t, "prompt");
	}
}
function Md(e, t, n, r) {
	if (e.type === "sse" && n !== 1) throw $("SSE MCP servers are available only with protocol: 1", n, r);
	if (!t.mcp[e.type]) throw $(`The agent does not support ${e.type} MCP servers`, n, r);
}
function $(t, n, r) {
	return new e("INVALID_CONFIGURATION", t, {
		...n === void 0 ? {} : { protocol: n },
		phase: r
	});
}
function Nd(e) {
	return e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\");
}
//#endregion
export { Ho as $, jo as A, O as At, Lo as B, ml as C, M as Ct, jl as D, A as Dt, Yl as E, z as Et, lu as F, e as Ft, Uo as G, $o as H, pu as I, t as It, Dl as J, Fo as K, _l as L, du as M, N as Mt, fu as N, ra as Nt, Zc as O, F as Ot, mu as P, Ai as Pt, Tl as Q, su as R, hu as S, P as St, cu as T, L as Tt, kl as U, Io as V, pl as W, vl as X, El as Y, Jo as Z, Iu as _, B as _t, Td as a, Al as at, yu as b, V as bt, sd as c, Nl as ct, td as d, Go as dt, Pl as et, rd as f, Vo as ft, q as g, oo as gt, Ru as h, Po as ht, Dd as i, ko as it, Ol as j, I as jt, es as k, R as kt, Z as l, Ml as lt, ad as m, Mo as mt, kd as n, gu as nt, wd as o, Xc as ot, id as p, Jl as pt, hl as q, Od as r, No as rt, Ed as s, gl as st, Ad as t, so as tt, X as u, Ll as ut, Y as v, io as vt, Wo as w, j as wt, Bu as x, H as xt, K as y, ao as yt, Zo as z };

//# sourceMappingURL=types.js.map