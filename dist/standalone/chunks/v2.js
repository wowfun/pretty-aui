import { At as e, Ct as t, Dt as n, Et as r, Ft as i, Mt as a, Nt as o, Ot as s, Pt as c, St as l, Tt as u, _ as ee, _t as d, a as te, bt as f, d as ne, f as re, g as p, h as ie, i as ae, jt as m, kt as h, l as oe, m as se, o as ce, r as le, s as ue, t as de, u as fe, v as g, vt as _, wt as v, xt as y, yt as b } from "./types.js";
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/v2/schema/index.js
var x = {
	initialize: "initialize",
	auth_login: "auth/login",
	providers_list: "providers/list",
	providers_set: "providers/set",
	providers_disable: "providers/disable",
	session_new: "session/new",
	session_set_config_option: "session/set_config_option",
	session_prompt: "session/prompt",
	session_cancel: "session/cancel",
	mcp_message: "mcp/message",
	session_list: "session/list",
	session_delete: "session/delete",
	session_fork: "session/fork",
	session_resume: "session/resume",
	session_close: "session/close",
	auth_logout: "auth/logout",
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
}, S = {
	session_request_permission: "session/request_permission",
	session_update: "session/update",
	mcp_connect: "mcp/connect",
	mcp_message: "mcp/message",
	mcp_disconnect: "mcp/disconnect",
	elicitation_create: "elicitation/create",
	elicitation_complete: "elicitation/complete"
}, C = { cancel_request: "$/cancel_request" }, w = m([n(), e()]).nullable(), T = e(), E = e(), pe = m([
	r("read"),
	r("edit"),
	r("delete"),
	r("move"),
	r("search"),
	r("execute"),
	r("think"),
	r("fetch"),
	r("switch_mode"),
	r("other"),
	e()
]), me = m([
	r("pending"),
	r("in_progress"),
	r("completed"),
	r("failed"),
	r("cancelled"),
	e()
]), he = m([
	r("assistant"),
	r("user"),
	e()
]), D = s({
	audience: d(y(he).nullish(), () => void 0),
	lastModified: d(c({ offset: !0 }).nullish(), () => void 0),
	priority: d(n().gte(0).lte(1).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ge = s({
	text: e(),
	annotations: d(D.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), O = e(), _e = s({
	data: e(),
	mimeType: O,
	uri: d(o().nullish(), () => void 0),
	annotations: d(D.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ve = s({
	data: e(),
	mimeType: O,
	annotations: d(D.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ye = m([
	r("light"),
	r("dark"),
	e()
]), be = s({
	src: o(),
	mimeType: d(O.nullish(), () => void 0),
	sizes: d(y(e()).nullish(), () => void 0),
	theme: d(ye.nullish(), () => void 0)
}), xe = s({
	name: e(),
	uri: o(),
	title: d(e().nullish(), () => void 0),
	description: d(e().nullish(), () => void 0),
	icons: d(y(be).nullish(), () => void 0),
	mimeType: d(O.nullish(), () => void 0),
	size: d(n().nullish(), () => void 0),
	annotations: d(D.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Se = s({
	text: e(),
	uri: o(),
	mimeType: d(O.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ce = s({
	blob: e(),
	uri: o(),
	mimeType: d(O.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), we = m([Se, Ce]), Te = s({
	resource: we,
	annotations: d(D.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), k = b(m([
	ge.and(s({ type: r("text") })),
	_e.and(s({ type: r("image") })),
	ve.and(s({ type: r("audio") })),
	xe.and(s({ type: r("resource_link") })),
	Te.and(s({ type: r("resource") })),
	_(s({ type: e() }), "type", [
		"audio",
		"image",
		"resource",
		"resource_link",
		"text"
	])
]), "type", [
	"audio",
	"image",
	"resource",
	"resource_link",
	"text"
]), Ee = s({
	content: k,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), De = m([
	r("text"),
	r("binary"),
	r("directory"),
	r("symlink"),
	e()
]), A = e(), j = s({ path: A }), M = s({
	oldPath: A,
	path: A
}), Oe = b(u(m([
	j.and(s({ operation: r("add") })),
	j.and(s({ operation: r("delete") })),
	j.and(s({ operation: r("modify") })),
	M.and(s({ operation: r("move") })),
	M.and(s({ operation: r("copy") })),
	_(s({ operation: e() }), "operation", [
		"add",
		"copy",
		"delete",
		"modify",
		"move"
	])
]), s({
	fileType: d(De.nullish(), () => void 0),
	mimeType: d(O.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
})), "operation", [
	"add",
	"copy",
	"delete",
	"modify",
	"move"
]), ke = m([r("git_patch"), e()]), Ae = s({
	format: ke,
	text: e()
}), je = s({
	changes: y(Oe),
	patch: d(Ae.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Me = e(), Ne = s({
	terminalId: Me,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Pe = b(m([
	Ee.and(s({ type: r("content") })),
	je.and(s({ type: r("diff") })),
	Ne.and(s({ type: r("terminal") })),
	_(s({ type: e() }), "type", [
		"content",
		"diff",
		"terminal"
	])
]), "type", [
	"content",
	"diff",
	"terminal"
]), Fe = s({
	path: A,
	line: d(v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ie = s({
	toolCallId: E,
	name: d(e().nullish(), () => void 0),
	title: d(e().nullish(), () => void 0),
	kind: d(pe.nullish(), () => void 0),
	status: d(me.nullish(), () => void 0),
	content: d(y(Pe).nullish(), () => void 0),
	locations: d(y(Fe).nullish(), () => void 0),
	rawInput: d(a().optional(), () => void 0),
	rawOutput: d(a().optional(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Le = s({ toolCall: Ie }), Re = s({
	command: e(),
	cwd: A,
	toolCallId: d(E.nullish(), () => void 0),
	terminalId: d(Me.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ze = b(m([
	Le.and(s({ type: r("tool_call") })),
	Re.and(s({ type: r("command") })),
	_(s({ type: e() }), "type", ["command", "tool_call"])
]), "type", ["command", "tool_call"]), Be = e(), Ve = m([
	r("allow_once"),
	r("allow_always"),
	r("reject_once"),
	r("reject_always"),
	e()
]), He = s({
	optionId: Be,
	name: e(),
	kind: Ve,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ue = s({
	sessionId: T,
	title: e(),
	description: d(e().nullish(), () => void 0),
	subject: ze.nullish(),
	options: l(He).min(1),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), We = s({
	sessionId: T,
	toolCallId: d(E.nullish(), () => void 0)
}), Ge = s({ requestId: w }), Ke = r("object"), qe = m([
	r("email"),
	r("uri"),
	r("date"),
	r("date-time"),
	e()
]), Je = s({
	const: e(),
	title: e(),
	description: d(e().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ye = s({
	title: d(e().nullish(), () => void 0),
	description: d(e().nullish(), () => void 0),
	minLength: v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(),
	maxLength: v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(),
	pattern: e().nullish(),
	format: qe.nullish(),
	default: d(e().nullish(), () => void 0),
	enum: l(e()).min(1).nullish(),
	oneOf: l(Je).min(1).nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Xe = s({
	title: d(e().nullish(), () => void 0),
	description: d(e().nullish(), () => void 0),
	minimum: n().nullish(),
	maximum: n().nullish(),
	default: d(n().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ze = s({
	title: d(e().nullish(), () => void 0),
	description: d(e().nullish(), () => void 0),
	minimum: n().nullish(),
	maximum: n().nullish(),
	default: d(n().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Qe = s({
	title: d(e().nullish(), () => void 0),
	description: d(e().nullish(), () => void 0),
	default: d(t().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), $e = s({
	enum: l(e()).min(1),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), et = s({
	anyOf: l(Je).min(1),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), tt = b(m([
	$e.and(s({ type: r("string") })),
	_(s({ type: e() }), "type", ["string"]),
	et
]), "type", ["string"]), nt = s({
	title: d(e().nullish(), () => void 0),
	description: d(e().nullish(), () => void 0),
	minItems: n().nullish(),
	maxItems: n().nullish(),
	items: tt,
	default: d(y(e()).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), rt = b(m([
	Ye.and(s({ type: r("string") })),
	Xe.and(s({ type: r("number") })),
	Ze.and(s({ type: r("integer") })),
	Qe.and(s({ type: r("boolean") })),
	nt.and(s({ type: r("array") })),
	_(s({ type: e() }), "type", [
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
]), it = s({
	type: d(Ke.optional().default("object"), () => "object"),
	title: d(e().nullish(), () => void 0),
	properties: h(e(), rt).optional().default({}),
	required: l(e()).nullish(),
	description: d(e().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), at = u(m([We, Ge]), s({ requestedSchema: it })), ot = e(), st = u(m([We, Ge]), s({
	elicitationId: ot,
	url: o()
})), ct = b(u(m([
	at.and(s({ mode: r("form") })),
	st.and(s({ mode: r("url") })),
	_(u(m([We, Ge]), s({ mode: e() })), "mode", ["form", "url"])
]), s({
	message: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
})), "mode", ["form", "url"]), lt = e(), ut = s({
	serverId: lt,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), dt = e(), ft = s({
	connectionId: dt,
	method: e(),
	params: h(e(), a()).nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), pt = s({
	connectionId: dt,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), mt = a();
s({
	id: w,
	method: e(),
	params: m([
		Ue,
		ct,
		ut,
		ft,
		pt,
		mt
	]).nullish()
});
var ht = v().gte(0).lte(65535), gt = s({
	name: e(),
	title: d(e().nullish(), () => void 0),
	version: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), _t = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), vt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), yt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), bt = s({
	image: d(_t.nullish(), () => void 0),
	audio: d(vt.nullish(), () => void 0),
	embeddedContext: d(yt.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), xt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), St = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Ct = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), wt = s({
	stdio: d(xt.nullish(), () => void 0),
	http: d(St.nullish(), () => void 0),
	acp: d(Ct.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Tt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Et = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Dt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Ot = s({
	prompt: d(bt.nullish(), () => void 0),
	mcp: d(wt.nullish(), () => void 0),
	delete: d(Tt.nullish(), () => void 0),
	additionalDirectories: d(Et.nullish(), () => void 0),
	fork: d(Dt.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), kt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), At = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), jt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Mt = m([r("full"), r("incremental")]), Nt = s({
	syncKind: Mt,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Pt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Ft = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), It = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Lt = s({
	didOpen: d(jt.nullish(), () => void 0),
	didChange: d(Nt.nullish(), () => void 0),
	didClose: d(Pt.nullish(), () => void 0),
	didSave: d(Ft.nullish(), () => void 0),
	didFocus: d(It.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Rt = s({
	document: d(Lt.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), zt = s({
	maxCount: d(v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Bt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Vt = s({
	maxCount: d(v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ht = s({
	maxCount: d(v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ut = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Wt = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Gt = s({
	recentFiles: d(zt.nullish(), () => void 0),
	relatedSnippets: d(Bt.nullish(), () => void 0),
	editHistory: d(Vt.nullish(), () => void 0),
	userActions: d(Ht.nullish(), () => void 0),
	openFiles: d(Ut.nullish(), () => void 0),
	diagnostics: d(Wt.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Kt = s({
	events: d(Rt.nullish(), () => void 0),
	context: d(Gt.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), qt = m([
	r("utf-16"),
	r("utf-32"),
	r("utf-8")
]), Jt = s({
	session: d(Ot.nullish(), () => void 0),
	auth: d(kt.nullish(), () => void 0),
	providers: d(At.nullish(), () => void 0),
	nes: d(Kt.nullish(), () => void 0),
	positionEncoding: d(qt.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), N = e(), Yt = s({
	name: e(),
	value: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Xt = s({
	methodId: N,
	name: e(),
	description: d(e().nullish(), () => void 0),
	args: d(y(e()).optional(), () => []),
	env: d(y(Yt).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Zt = s({
	methodId: N,
	name: e(),
	description: d(e().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Qt = b(m([
	Xt.and(s({ type: r("terminal") })),
	Zt.and(s({ type: r("agent") })),
	_(s({
		type: e(),
		methodId: N,
		name: e(),
		description: d(e().nullish(), () => void 0),
		_meta: d(h(e(), a()).nullish(), () => void 0)
	}), "type", ["agent", "terminal"])
]), "type", ["agent", "terminal"]), $t = s({
	protocolVersion: ht,
	info: gt,
	capabilities: d(Jt.optional().default({}), () => ({})),
	authMethods: d(y(Qt).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), en = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), tn = e(), nn = m([
	r("anthropic"),
	r("openai"),
	r("azure"),
	r("vertex"),
	r("bedrock"),
	e()
]), rn = s({
	apiType: nn,
	baseUrl: o(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), an = s({
	providerId: tn,
	supported: f(y(nn), () => []),
	required: t(),
	current: rn.nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), on = s({
	providers: l(an),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), sn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), cn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), ln = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), P = e(), un = m([
	r("mode"),
	r("model"),
	r("model_config"),
	r("thought_level"),
	e()
]), F = e(), dn = s({
	value: F,
	name: e(),
	description: d(e().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), fn = e(), pn = s({
	groupId: fn,
	name: e(),
	options: f(y(dn), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), mn = m([l(dn), l(pn)]), hn = s({
	currentValue: F,
	options: mn
}), gn = s({ currentValue: t() }), I = b(u(m([
	hn.and(s({ type: r("select") })),
	gn.and(s({ type: r("boolean") })),
	_(s({ type: e() }), "type", ["boolean", "select"])
]), s({
	configId: P,
	name: e(),
	description: d(e().nullish(), () => void 0),
	category: d(un.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
})), "type", ["boolean", "select"]), _n = s({
	sessionId: T,
	configOptions: d(y(I).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), vn = s({
	sessionId: T,
	cwd: A,
	additionalDirectories: d(y(A).optional(), () => []),
	title: d(e().nullish(), () => void 0),
	updatedAt: d(c({ offset: !0 }).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), yn = e(), bn = s({
	sessions: f(y(vn), () => []),
	nextCursor: d(yn.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), xn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Sn = s({
	sessionId: T,
	configOptions: d(y(I).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Cn = s({
	configOptions: d(y(I).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), wn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Tn = s({
	configOptions: f(y(I), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), En = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Dn = s({
	sessionId: T,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), L = e(), R = s({
	line: v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	character: v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), z = s({
	start: R,
	end: R,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), On = s({
	range: z,
	newText: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), kn = s({
	suggestionId: L,
	uri: o(),
	edits: l(On).min(1),
	cursorPosition: d(R.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), An = s({
	suggestionId: L,
	uri: o(),
	position: R,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), jn = s({
	suggestionId: L,
	uri: o(),
	position: R,
	newName: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Mn = s({
	suggestionId: L,
	uri: o(),
	search: e(),
	replace: e(),
	isRegex: t().nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Nn = b(m([
	kn.and(s({ kind: r("edit") })),
	An.and(s({ kind: r("jump") })),
	jn.and(s({ kind: r("rename") })),
	Mn.and(s({ kind: r("searchAndReplace") })),
	_(s({
		kind: e(),
		suggestionId: L
	}), "kind", [
		"edit",
		"jump",
		"rename",
		"searchAndReplace"
	])
]), "kind", [
	"edit",
	"jump",
	"rename",
	"searchAndReplace"
]), Pn = s({
	suggestions: l(Nn),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Fn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), In = a(), B = a(), Ln = m([
	r(-32700),
	r(-32600),
	r(-32601),
	r(-32602),
	r(-32603),
	r(-32800),
	r(-32e3),
	r(-32002),
	v().min(-2147483648, { error: "Invalid value: Expected int32 to be >= -2147483648" }).max(2147483647, { error: "Invalid value: Expected int32 to be <= 2147483647" })
]), Rn = s({
	code: Ln,
	message: e(),
	data: d(a().optional(), () => void 0)
});
m([s({
	id: w,
	result: m([
		$t,
		en,
		on,
		sn,
		cn,
		ln,
		_n,
		bn,
		xn,
		Sn,
		Cn,
		wn,
		Tn,
		En,
		Dn,
		Pn,
		Fn,
		In,
		B
	])
}), s({
	id: w,
	error: Rn
})]);
var V = e(), H = s({
	messageId: V,
	content: k,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), zn = s({
	messageId: V,
	content: d(y(k).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Bn = s({
	messageId: V,
	content: d(y(k).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Vn = s({
	messageId: V,
	content: d(y(k).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Hn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Un = m([
	r("end_turn"),
	r("max_tokens"),
	r("max_turn_requests"),
	r("refusal"),
	r("cancelled"),
	e()
]), Wn = s({
	totalTokens: n(),
	inputTokens: n(),
	outputTokens: n(),
	thoughtTokens: d(n().nullish(), () => void 0),
	cachedReadTokens: d(n().nullish(), () => void 0),
	cachedWriteTokens: d(n().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Gn = s({
	stopReason: d(Un.nullish(), () => void 0),
	usage: d(Wn.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Kn = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), qn = b(m([
	Hn.and(s({ state: r("running") })),
	Gn.and(s({ state: r("idle") })),
	Kn.and(s({ state: r("requires_action") })),
	_(s({ state: e() }), "state", [
		"idle",
		"requires_action",
		"running"
	])
]), "state", [
	"idle",
	"requires_action",
	"running"
]), Jn = s({
	toolCallId: E,
	content: Pe,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Yn = s({
	data: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Xn = s({
	exitCode: d(v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }).nullish(), () => void 0),
	signal: d(e().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Zn = s({
	terminalId: Me,
	command: d(e().nullish(), () => void 0),
	cwd: d(A.nullish(), () => void 0),
	output: d(Yn.nullish(), () => void 0),
	exitStatus: d(Xn.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Qn = s({
	terminalId: Me,
	data: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), U = e(), $n = m([
	r("high"),
	r("medium"),
	r("low"),
	e()
]), er = m([
	r("pending"),
	r("in_progress"),
	r("completed"),
	r("cancelled"),
	e()
]), tr = s({
	content: e(),
	priority: $n,
	status: er,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), nr = s({
	planId: U,
	entries: f(y(tr), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), rr = s({
	planId: U,
	uri: o(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ir = s({
	planId: U,
	content: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ar = b(m([
	nr.and(s({ type: r("items") })),
	rr.and(s({ type: r("file") })),
	ir.and(s({ type: r("markdown") })),
	_(s({
		type: e(),
		planId: U
	}), "type", [
		"file",
		"items",
		"markdown"
	])
]), "type", [
	"file",
	"items",
	"markdown"
]), or = s({
	plan: ar,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), sr = s({
	planId: U,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), cr = s({
	hint: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), lr = b(m([cr.and(s({ type: r("text") })), _(s({ type: e() }), "type", ["text"])]), "type", ["text"]), ur = s({
	name: e(),
	description: e(),
	input: d(lr.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), dr = s({
	availableCommands: f(y(ur), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), fr = s({
	configOptions: f(y(I), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), pr = s({
	title: d(e().nullish(), () => void 0),
	updatedAt: d(c({ offset: !0 }).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), mr = s({
	amount: n(),
	currency: e().regex(/^[A-Z]{3}$/),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), hr = s({
	used: n(),
	size: n(),
	cost: d(mr.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), gr = e(), _r = m([
	r("in_progress"),
	r("completed"),
	r("failed"),
	r("cancelled"),
	e()
]), vr = s({
	compactionId: gr,
	status: _r,
	summary: d(y(k).nullish(), () => void 0),
	error: d(e().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), yr = s({
	compactionId: gr,
	content: k,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), br = b(m([
	H.and(s({ sessionUpdate: r("user_message_chunk") })),
	zn.and(s({ sessionUpdate: r("user_message") })),
	H.and(s({ sessionUpdate: r("agent_message_chunk") })),
	Bn.and(s({ sessionUpdate: r("agent_message") })),
	H.and(s({ sessionUpdate: r("agent_thought_chunk") })),
	Vn.and(s({ sessionUpdate: r("agent_thought") })),
	qn.and(s({ sessionUpdate: r("state_update") })),
	Jn.and(s({ sessionUpdate: r("tool_call_content_chunk") })),
	Ie.and(s({ sessionUpdate: r("tool_call_update") })),
	Zn.and(s({ sessionUpdate: r("terminal_update") })),
	Qn.and(s({ sessionUpdate: r("terminal_output_chunk") })),
	or.and(s({ sessionUpdate: r("plan_update") })),
	sr.and(s({ sessionUpdate: r("plan_removed") })),
	dr.and(s({ sessionUpdate: r("available_commands_update") })),
	fr.and(s({ sessionUpdate: r("config_option_update") })),
	pr.and(s({ sessionUpdate: r("session_info_update") })),
	hr.and(s({ sessionUpdate: r("usage_update") })),
	vr.and(s({ sessionUpdate: r("compaction_update") })),
	yr.and(s({ sessionUpdate: r("compaction_summary_chunk") })),
	_(s({ sessionUpdate: e() }), "sessionUpdate", [
		"agent_message",
		"agent_message_chunk",
		"agent_thought",
		"agent_thought_chunk",
		"available_commands_update",
		"compaction_summary_chunk",
		"compaction_update",
		"config_option_update",
		"plan_removed",
		"plan_update",
		"session_info_update",
		"state_update",
		"terminal_output_chunk",
		"terminal_update",
		"tool_call_content_chunk",
		"tool_call_update",
		"usage_update",
		"user_message",
		"user_message_chunk"
	])
]), "sessionUpdate", [
	"agent_message",
	"agent_message_chunk",
	"agent_thought",
	"agent_thought_chunk",
	"available_commands_update",
	"compaction_summary_chunk",
	"compaction_update",
	"config_option_update",
	"plan_removed",
	"plan_update",
	"session_info_update",
	"state_update",
	"terminal_output_chunk",
	"terminal_update",
	"tool_call_content_chunk",
	"tool_call_update",
	"usage_update",
	"user_message",
	"user_message_chunk"
]), xr = s({
	sessionId: T,
	update: br,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Sr = s({
	elicitationId: ot,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), W = s({
	connectionId: dt,
	method: e(),
	params: d(h(e(), a()).nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Cr = a();
s({
	method: e(),
	params: m([
		xr,
		Sr,
		W,
		Cr
	]).nullish()
});
var wr = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Tr = s({
	terminal: d(wr.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Er = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Dr = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Or = s({
	form: d(Er.nullish(), () => void 0),
	url: d(Dr.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), kr = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Ar = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), jr = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Mr = s({
	jump: d(kr.nullish(), () => void 0),
	rename: d(Ar.nullish(), () => void 0),
	searchAndReplace: d(jr.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Nr = s({
	auth: d(Tr.nullish(), () => void 0),
	elicitation: d(Or.nullish(), () => void 0),
	nes: d(Mr.nullish(), () => void 0),
	positionEncodings: d(y(qt).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Pr = s({
	protocolVersion: ht,
	info: gt,
	capabilities: d(Nr.optional().default({}), () => ({})),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Fr = s({
	methodId: N,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ir = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Lr = s({
	providerId: tn,
	apiType: nn,
	baseUrl: o(),
	headers: h(e(), e()).optional(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Rr = s({
	providerId: tn,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), zr = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Br = s({
	name: e(),
	value: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Vr = s({
	name: e(),
	url: o(),
	headers: l(Br).optional(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Hr = s({
	name: e(),
	serverId: lt,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ur = s({
	name: e(),
	command: A,
	args: l(e()).optional(),
	env: l(Yt).optional(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Wr = b(m([
	Vr.and(s({ type: r("http") })),
	Hr.and(s({ type: r("acp") })),
	Ur.and(s({ type: r("stdio") })),
	_(s({ type: e() }), "type", [
		"acp",
		"http",
		"stdio"
	])
]), "type", [
	"acp",
	"http",
	"stdio"
]), Gr = s({
	cwd: A,
	additionalDirectories: d(y(A).optional(), () => []),
	mcpServers: d(y(Wr).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Kr = s({
	cwd: A.nullish(),
	cursor: yn.nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), qr = s({
	sessionId: T,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Jr = s({
	sessionId: T,
	cwd: A,
	additionalDirectories: d(y(A).optional(), () => []),
	mcpServers: d(y(Wr).optional(), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Yr = s({ _meta: d(h(e(), a()).nullish(), () => void 0) }), Xr = b(m([Yr.and(s({ type: r("start") })), _(s({
	type: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), "type", ["start"])]), "type", ["start"]), Zr = s({
	sessionId: T,
	cwd: A,
	additionalDirectories: d(y(A).optional(), () => []),
	mcpServers: d(y(Wr).optional(), () => []),
	replayFrom: d(Xr.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Qr = s({
	sessionId: T,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), $r = b(u(m([
	s({
		value: F,
		type: r("id")
	}),
	s({
		value: t(),
		type: r("boolean")
	}),
	_(s({
		type: e(),
		value: a()
	}), "type", ["boolean", "id"])
]), s({
	sessionId: T,
	configId: P,
	_meta: d(h(e(), a()).nullish(), () => void 0)
})), "type", ["boolean", "id"]), ei = s({
	sessionId: T,
	prompt: l(k),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ti = s({
	uri: o(),
	name: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ni = s({
	name: e(),
	owner: e(),
	remoteUrl: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ri = s({
	workspaceUri: d(o().nullish(), () => void 0),
	workspaceFolders: l(ti).nullish(),
	repository: d(ni.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ii = m([
	r("automatic"),
	r("diagnostic"),
	r("manual"),
	e()
]), ai = s({
	uri: o(),
	languageId: e(),
	text: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), oi = s({
	startLine: v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	endLine: v().gte(0).max(4294967295, { error: "Invalid value: Expected uint32 to be <= 4294967295" }),
	text: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), si = s({
	uri: o(),
	excerpts: l(oi),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ci = s({
	uri: o(),
	diff: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), li = s({
	action: e(),
	uri: o(),
	position: R,
	timestampMs: n(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ui = s({
	uri: o(),
	languageId: e(),
	visibleRange: d(z.nullish(), () => void 0),
	lastFocusedMs: d(n().nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), di = m([
	r("error"),
	r("warning"),
	r("information"),
	r("hint"),
	e()
]), fi = s({
	uri: o(),
	range: z,
	severity: di,
	message: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), pi = s({
	recentFiles: l(ai).nullish(),
	relatedSnippets: l(si).nullish(),
	editHistory: l(ci).nullish(),
	userActions: l(li).nullish(),
	openFiles: l(ui).nullish(),
	diagnostics: l(fi).nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), mi = s({
	sessionId: T,
	uri: o(),
	version: n(),
	position: R,
	selection: z.nullish(),
	triggerKind: ii,
	context: pi.nullish(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), hi = s({
	sessionId: T,
	_meta: d(h(e(), a()).nullish(), () => void 0)
});
s({
	id: w,
	method: e(),
	params: m([
		Pr,
		Fr,
		Ir,
		Lr,
		Rr,
		zr,
		Gr,
		Kr,
		qr,
		Jr,
		Zr,
		Qr,
		$r,
		ei,
		ri,
		mi,
		hi,
		ft,
		mt
	]).nullish()
});
var gi = s({
	optionId: Be,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), _i = b(m([
	s({ outcome: r("cancelled") }),
	gi.and(s({ outcome: r("selected") })),
	_(s({ outcome: e() }), "outcome", ["cancelled", "selected"])
]), "outcome", ["cancelled", "selected"]), vi = s({
	outcome: _i,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), yi = m([
	e(),
	n(),
	n(),
	t(),
	l(e())
]), bi = s({ content: h(e(), yi).nullish() }), xi = b(u(m([
	bi.and(s({ action: r("accept") })),
	s({ action: r("decline") }),
	s({ action: r("cancel") }),
	_(s({ action: e() }), "action", [
		"accept",
		"cancel",
		"decline"
	])
]), s({ _meta: d(h(e(), a()).nullish(), () => void 0) })), "action", [
	"accept",
	"cancel",
	"decline"
]), Si = s({
	connectionId: dt,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ci = s({ _meta: d(h(e(), a()).nullish(), () => void 0) });
m([s({
	id: w,
	result: m([
		vi,
		xi,
		Si,
		Ci,
		B,
		In
	])
}), s({
	id: w,
	error: Rn
})]);
var wi = s({
	sessionId: T,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ti = s({
	sessionId: T,
	uri: o(),
	languageId: e(),
	version: n(),
	text: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ei = s({
	range: z.nullish(),
	text: e(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Di = s({
	sessionId: T,
	uri: o(),
	version: n(),
	contentChanges: f(y(Ei), () => []),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Oi = s({
	sessionId: T,
	uri: o(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ki = s({
	sessionId: T,
	uri: o(),
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Ai = s({
	sessionId: T,
	uri: o(),
	version: n(),
	position: R,
	visibleRange: z,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), ji = s({
	sessionId: T,
	suggestionId: L,
	_meta: d(h(e(), a()).nullish(), () => void 0)
}), Mi = m([
	r("rejected"),
	r("ignored"),
	r("replaced"),
	r("cancelled"),
	e()
]), Ni = s({
	sessionId: T,
	suggestionId: L,
	reason: d(Mi.nullish(), () => void 0),
	_meta: d(h(e(), a()).nullish(), () => void 0)
});
s({
	method: e(),
	params: m([
		wi,
		Ti,
		Di,
		Oi,
		ki,
		Ai,
		ji,
		Ni,
		W,
		Cr
	]).nullish()
});
var Pi = s({
	requestId: w,
	_meta: d(h(e(), a()).nullish(), () => void 0)
});
s({
	method: e(),
	params: Pi.nullish()
});
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/v2/schema/guards.gen.js
function G(e, t) {
	return typeof e == "object" && e ? e[t] : void 0;
}
Le.and(s({ type: r("tool_call") })), Re.and(s({ type: r("command") })), Ee.and(s({ type: r("content") })), je.and(s({ type: r("diff") })), Ne.and(s({ type: r("terminal") }));
var Fi = ge.and(s({ type: r("text") })), Ii = _e.and(s({ type: r("image") })), Li = ve.and(s({ type: r("audio") })), Ri = xe.and(s({ type: r("resource_link") })), zi = Te.and(s({ type: r("resource") }));
j.and(s({ operation: r("add") })), j.and(s({ operation: r("delete") })), j.and(s({ operation: r("modify") })), M.and(s({ operation: r("move") })), M.and(s({ operation: r("copy") })), at.and(s({ mode: r("form") })).and(s({ message: e() })), st.and(s({ mode: r("url") })).and(s({ message: e() })), m([We, Ge]).and(s({ message: e() })), Ye.and(s({ type: r("string") })), Xe.and(s({ type: r("number") })), Ze.and(s({ type: r("integer") })), Qe.and(s({ type: r("boolean") })), nt.and(s({ type: r("array") })), $e.and(s({ type: r("string") })), Xt.and(s({ type: r("terminal") })), Zt.and(s({ type: r("agent") })), s({
	methodId: N,
	name: e()
}), hn.and(s({ type: r("select") })).and(s({
	configId: P,
	name: e()
})), gn.and(s({ type: r("boolean") })).and(s({
	configId: P,
	name: e()
})), s({
	configId: P,
	name: e()
}), kn.and(s({ kind: r("edit") })), An.and(s({ kind: r("jump") })), jn.and(s({ kind: r("rename") })), Mn.and(s({ kind: r("searchAndReplace") })), s({ suggestionId: L });
var Bi = H.and(s({ sessionUpdate: r("user_message_chunk") })), Vi = zn.and(s({ sessionUpdate: r("user_message") })), Hi = H.and(s({ sessionUpdate: r("agent_message_chunk") })), Ui = Bn.and(s({ sessionUpdate: r("agent_message") })), Wi = H.and(s({ sessionUpdate: r("agent_thought_chunk") })), Gi = Vn.and(s({ sessionUpdate: r("agent_thought") })), Ki = qn.and(s({ sessionUpdate: r("state_update") })), qi = Jn.and(s({ sessionUpdate: r("tool_call_content_chunk") })), Ji = Ie.and(s({ sessionUpdate: r("tool_call_update") })), Yi = Zn.and(s({ sessionUpdate: r("terminal_update") })), Xi = Qn.and(s({ sessionUpdate: r("terminal_output_chunk") })), Zi = or.and(s({ sessionUpdate: r("plan_update") })), Qi = sr.and(s({ sessionUpdate: r("plan_removed") })), $i = dr.and(s({ sessionUpdate: r("available_commands_update") })), ea = fr.and(s({ sessionUpdate: r("config_option_update") })), ta = pr.and(s({ sessionUpdate: r("session_info_update") })), na = hr.and(s({ sessionUpdate: r("usage_update") })), ra = vr.and(s({ sessionUpdate: r("compaction_update") })), ia = yr.and(s({ sessionUpdate: r("compaction_summary_chunk") })), aa = Hn.and(s({ state: r("running") })), oa = Gn.and(s({ state: r("idle") })), sa = Kn.and(s({ state: r("requires_action") }));
nr.and(s({ type: r("items") })), rr.and(s({ type: r("file") })), ir.and(s({ type: r("markdown") })), s({ planId: U }), cr.and(s({ type: r("text") })), Vr.and(s({ type: r("http") })), Hr.and(s({ type: r("acp") })), Ur.and(s({ type: r("stdio") })), Yr.and(s({ type: r("start") })), s({ type: r("id") }).and(s({ value: F })).and(s({
	sessionId: T,
	configId: P
})), s({ type: r("boolean") }).and(s({ value: t() })).and(s({
	sessionId: T,
	configId: P
})), s({ value: a() }).and(s({
	sessionId: T,
	configId: P
})), s({ outcome: r("cancelled") }), gi.and(s({ outcome: r("selected") })), bi.and(s({ action: r("accept") })), s({ action: r("decline") }), s({ action: r("cancel") });
var ca = {
	isText(e) {
		return G(e, "type") === "text" && Fi.safeParse(e).success;
	},
	isImage(e) {
		return G(e, "type") === "image" && Ii.safeParse(e).success;
	},
	isAudio(e) {
		return G(e, "type") === "audio" && Li.safeParse(e).success;
	},
	isResourceLink(e) {
		return G(e, "type") === "resource_link" && Ri.safeParse(e).success;
	},
	isResource(e) {
		return G(e, "type") === "resource" && zi.safeParse(e).success;
	},
	isCustom(e) {
		let t = G(e, "type");
		return typeof t == "string" && ![
			"audio",
			"image",
			"resource",
			"resource_link",
			"text"
		].includes(t);
	}
}, la = {
	isUserMessageChunk(e) {
		return G(e, "sessionUpdate") === "user_message_chunk" && Bi.safeParse(e).success;
	},
	isUserMessage(e) {
		return G(e, "sessionUpdate") === "user_message" && Vi.safeParse(e).success;
	},
	isAgentMessageChunk(e) {
		return G(e, "sessionUpdate") === "agent_message_chunk" && Hi.safeParse(e).success;
	},
	isAgentMessage(e) {
		return G(e, "sessionUpdate") === "agent_message" && Ui.safeParse(e).success;
	},
	isAgentThoughtChunk(e) {
		return G(e, "sessionUpdate") === "agent_thought_chunk" && Wi.safeParse(e).success;
	},
	isAgentThought(e) {
		return G(e, "sessionUpdate") === "agent_thought" && Gi.safeParse(e).success;
	},
	isStateUpdate(e) {
		return G(e, "sessionUpdate") === "state_update" && Ki.safeParse(e).success;
	},
	isToolCallContentChunk(e) {
		return G(e, "sessionUpdate") === "tool_call_content_chunk" && qi.safeParse(e).success;
	},
	isToolCallUpdate(e) {
		return G(e, "sessionUpdate") === "tool_call_update" && Ji.safeParse(e).success;
	},
	isTerminalUpdate(e) {
		return G(e, "sessionUpdate") === "terminal_update" && Yi.safeParse(e).success;
	},
	isTerminalOutputChunk(e) {
		return G(e, "sessionUpdate") === "terminal_output_chunk" && Xi.safeParse(e).success;
	},
	isPlanUpdate(e) {
		return G(e, "sessionUpdate") === "plan_update" && Zi.safeParse(e).success;
	},
	isPlanRemoved(e) {
		return G(e, "sessionUpdate") === "plan_removed" && Qi.safeParse(e).success;
	},
	isAvailableCommandsUpdate(e) {
		return G(e, "sessionUpdate") === "available_commands_update" && $i.safeParse(e).success;
	},
	isConfigOptionUpdate(e) {
		return G(e, "sessionUpdate") === "config_option_update" && ea.safeParse(e).success;
	},
	isSessionInfoUpdate(e) {
		return G(e, "sessionUpdate") === "session_info_update" && ta.safeParse(e).success;
	},
	isUsageUpdate(e) {
		return G(e, "sessionUpdate") === "usage_update" && na.safeParse(e).success;
	},
	isCompactionUpdate(e) {
		return G(e, "sessionUpdate") === "compaction_update" && ra.safeParse(e).success;
	},
	isCompactionSummaryChunk(e) {
		return G(e, "sessionUpdate") === "compaction_summary_chunk" && ia.safeParse(e).success;
	},
	isCustom(e) {
		let t = G(e, "sessionUpdate");
		return typeof t == "string" && ![
			"agent_message",
			"agent_message_chunk",
			"agent_thought",
			"agent_thought_chunk",
			"available_commands_update",
			"compaction_summary_chunk",
			"compaction_update",
			"config_option_update",
			"plan_removed",
			"plan_update",
			"session_info_update",
			"state_update",
			"terminal_output_chunk",
			"terminal_update",
			"tool_call_content_chunk",
			"tool_call_update",
			"usage_update",
			"user_message",
			"user_message_chunk"
		].includes(t);
	}
}, ua = {
	isRunning(e) {
		return G(e, "state") === "running" && aa.safeParse(e).success;
	},
	isIdle(e) {
		return G(e, "state") === "idle" && oa.safeParse(e).success;
	},
	isRequiresAction(e) {
		return G(e, "state") === "requires_action" && sa.safeParse(e).success;
	},
	isCustom(e) {
		let t = G(e, "state");
		return typeof t == "string" && ![
			"idle",
			"requires_action",
			"running"
		].includes(t);
	}
};
//#endregion
//#region node_modules/.pnpm/@agentclientprotocol+sdk@1.4.0_zod@4.4.3/node_modules/@agentclientprotocol/sdk/dist/v2/acp.js
function K(e) {
	return e ?? {};
}
var da = /* @__PURE__ */ new Set([
	...Object.values(x),
	...Object.values(S),
	...Object.values(C)
]);
function q(e, t, n, r = !1) {
	if (!(Object.hasOwn(t, e) || r && e === C.cancel_request) && da.has(e)) throw TypeError(`ACP v2 ${n} method '${e}' is not valid in this direction`);
}
function fa(e, t) {
	if (da.has(e)) throw TypeError(`Cannot replace the built-in ACP v2 ${t} parser for '${e}'`);
}
function pa(e, t, n) {
	for (let r of e) q(r.method, r.kind === "request" ? t : n, r.kind, r.kind === "notification");
}
function ma(e) {
	let t = Pr.parse(e);
	if (t.protocolVersion !== 2) throw g.invalidParams({
		expectedProtocolVersion: 2,
		receivedProtocolVersion: t.protocolVersion
	}, "The v2 API only supports protocol version 2");
	return structuredClone(t);
}
function ha(e) {
	return ma({
		...typeof e == "object" && e && !Array.isArray(e) ? e : {},
		protocolVersion: 2
	});
}
function ga(e) {
	let t = $t.parse(e);
	if (t.protocolVersion !== 2) throw g.invalidRequest({
		expectedProtocolVersion: 2,
		receivedProtocolVersion: t.protocolVersion
	}, "The v2 API only supports protocol version 2");
	return structuredClone(t);
}
function _a(e) {
	return structuredClone(e);
}
function va() {
	let e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var ya = class {
	phase = "uninitialized";
	request;
	barrier = va();
	constructor() {
		this.barrier.promise.catch(() => {});
	}
	get status() {
		return this.phase;
	}
	get initialized() {
		return this.barrier.promise.then(_a);
	}
	begin(e) {
		if (this.phase !== "uninitialized") throw g.invalidRequest("ACP v2 initialize may only be requested once per connection");
		let t = structuredClone(e);
		this.request = t, this.phase = "initializing";
	}
	complete(e) {
		if (this.phase !== "initializing" || !this.request) throw g.invalidRequest("ACP v2 initialization is not in progress");
		let t = {
			request: structuredClone(this.request),
			response: structuredClone(e)
		};
		this.phase = "initialized", this.barrier.resolve(t);
	}
	fail(e) {
		(this.phase === "uninitialized" || this.phase === "initializing") && (this.phase = "failed", this.request = void 0, this.barrier.reject(e ?? g.invalidRequest("ACP v2 connection initialization failed")));
	}
	waitUntilInitialized(e) {
		return this.phase === "initialized" ? Promise.resolve() : this.phase === "initializing" ? this.barrier.promise.then(() => {}) : Promise.reject(xa(e));
	}
}, ba = /* @__PURE__ */ new WeakMap();
function J(e) {
	let t = ba.get(e);
	return t || (t = new ya(), ba.set(e, t), e.signal.aborted ? t.fail(e.signal.reason) : e.signal.addEventListener("abort", () => t?.fail(e.signal.reason), { once: !0 })), t;
}
function xa(e) {
	return g.invalidRequest(`ACP v2 connection must be initialized before '${e}'`);
}
async function Sa(e, t) {
	let n = xa(e.method);
	return t.fail(n), Ca(e, n);
}
async function Ca(e, t) {
	return e.kind === "request" && await e.responder.respondWithError(t), p.yes();
}
function wa() {
	return {
		async handleMessage(e, t) {
			let n = J(t);
			return e.kind === "notification" && e.method === C.cancel_request ? n.status === "initializing" || n.status === "initialized" ? p.yes() : Sa(e, n) : n.status === "initialized" ? p.no(e) : n.status === "initializing" ? (await n.waitUntilInitialized(e.method), p.no(e)) : Sa(e, n);
		},
		describe: () => "client-initialization"
	};
}
function Ta(e, t) {
	return Ha(e.response, t);
}
function Ea(e, t, n) {
	return e.map((e) => {
		if (e.kind !== "request") return e;
		let r = t[e.method], i = e.mapResponse;
		return {
			...e,
			mapResponse: r ? (t) => {
				let a = Ta(r, t);
				return n && e.method === x.initialize && n(a), i ? i(a) : a;
			} : i
		};
	});
}
function Da(e) {
	return typeof e == "object" && !!e && "readable" in e && "writable" in e;
}
function Oa() {
	let e = new TransformStream(), t = new TransformStream();
	return [{
		readable: t.readable,
		writable: e.writable
	}, {
		readable: e.readable,
		writable: t.writable
	}];
}
var Y = {
	agent: {
		initialize: x.initialize,
		auth: {
			login: x.auth_login,
			logout: x.auth_logout
		},
		providers: {
			list: x.providers_list,
			set: x.providers_set,
			disable: x.providers_disable
		},
		session: {
			new: x.session_new,
			list: x.session_list,
			delete: x.session_delete,
			fork: x.session_fork,
			resume: x.session_resume,
			close: x.session_close,
			setConfigOption: x.session_set_config_option,
			prompt: x.session_prompt,
			cancel: x.session_cancel
		},
		mcp: { message: x.mcp_message },
		nes: {
			start: x.nes_start,
			suggest: x.nes_suggest,
			accept: x.nes_accept,
			reject: x.nes_reject,
			close: x.nes_close
		},
		document: {
			didOpen: x.document_did_open,
			didChange: x.document_did_change,
			didClose: x.document_did_close,
			didSave: x.document_did_save,
			didFocus: x.document_did_focus
		}
	},
	client: {
		session: {
			requestPermission: S.session_request_permission,
			update: S.session_update
		},
		mcp: {
			connect: S.mcp_connect,
			message: S.mcp_message,
			disconnect: S.mcp_disconnect
		},
		elicitation: {
			create: S.elicitation_create,
			complete: S.elicitation_complete
		}
	},
	protocol: { cancelRequest: C.cancel_request }
}, ka = Symbol("startActiveSession"), Aa = class {
	cx;
	currentRequestId;
	constructor(e, t) {
		this.cx = e, this.currentRequestId = t;
	}
	get initialized() {
		return J(this.cx).initialized;
	}
	get initializationLifecycle() {
		return J(this.cx);
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
	sendBatch(e) {
		return this.cx.sendBatch(e);
	}
	addDynamicHandler(e) {
		return this.cx.addDynamicHandler(e);
	}
}, ja = class e extends Aa {
	constructor(e, t) {
		super(e, t);
	}
	static create(t, n) {
		return new e(t, n);
	}
	request(e, t, n) {
		q(e, $, "request");
		let r = $[e];
		return this.initializationLifecycle.waitUntilInitialized(e).then(() => this.sendRequest(e, t, r ? (e) => Ta(r, e) : void 0, n));
	}
	notify(e, t) {
		return q(e, Za, "notification", !0), this.initializationLifecycle.waitUntilInitialized(e).then(() => this.sendNotification(e, t));
	}
	batch(e) {
		return pa(e, $, Za), this.initializationLifecycle.waitUntilInitialized("batch").then(() => this.sendBatch(Ea(e, $)));
	}
}, Ma = class e extends Aa {
	closeOnInitializationFailure;
	constructor(e, t, n) {
		super(e, t), this.closeOnInitializationFailure = n;
	}
	static create(t, n, r) {
		return new e(t, n, r);
	}
	[ka](e, t) {
		return this.request(x.session_new, e, t).then((e) => this.attachSession(e));
	}
	buildSession(e) {
		return typeof e == "string" ? Ba.create(this, {
			cwd: e,
			mcpServers: []
		}) : Ba.create(this, e);
	}
	attachSession(e) {
		let t = new Ra(), n = /* @__PURE__ */ new Set(), r = {
			enqueue: (e) => t.enqueue(e),
			reject: (e) => t.reject(e),
			clearErrors: () => t.clearErrors(),
			fail: (e) => t.fail(e),
			next: () => t.next(),
			nextAfter: (e, n) => t.nextAfter(e, n),
			beginPrompt: () => {
				let e = {
					updateCursor: t.cursor(),
					overlapController: new AbortController()
				};
				if (n.size > 0) {
					let t = /* @__PURE__ */ Error("readText() cannot attribute updates across overlapping prompts; use nextUpdate() instead");
					for (let e of n) e.overlapController.abort(t);
					e.overlapController.abort(t);
				}
				return n.add(e), e;
			},
			cancelPrompt: (e) => n.delete(e),
			isAwaitingPromptCompletion: () => n.size > 0,
			completePrompt: () => {
				n.clear();
			}
		}, i = this.connectionContext.signal, a = () => {
			t.fail(i.reason ?? /* @__PURE__ */ Error("ACP connection closed"));
		};
		i.aborted ? a() : i.addEventListener("abort", a);
		let o = no(this.connectionContext).attach(e, r), s = new ee(() => {
			i.removeEventListener("abort", a);
		});
		return Va.create(this, e, r, [o, s]);
	}
	request(e, t, n) {
		q(e, Q, "request");
		let r = Q[e], i = this.initializationLifecycle;
		if (e === x.initialize) {
			let a = ha(t);
			i.begin(a);
			let o;
			try {
				o = this.sendRequest(e, a, (e) => {
					let t = Ta(r, e);
					return i.complete(t), t;
				}, n);
			} catch (e) {
				throw i.fail(e), this.closeOnInitializationFailure?.(e), e;
			}
			return o.catch((e) => {
				i.status !== "initialized" && (i.fail(e), this.closeOnInitializationFailure?.(e));
			}), o;
		}
		return i.waitUntilInitialized(e).then(() => this.sendRequest(e, t, r ? (e) => Ta(r, e) : void 0, n));
	}
	notify(e, t) {
		return q(e, Xa, "notification", !0), this.initializationLifecycle.waitUntilInitialized(e).then(() => this.sendNotification(e, t));
	}
	batch(e) {
		pa(e, Q, Xa);
		let t = e.filter((e) => e.kind === "request" && e.method === x.initialize);
		if (t.length > 0) {
			if (e.length !== 1 || t.length !== 1) return Promise.reject(g.invalidRequest("ACP v2 initialize must be the only entry in its batch"));
			let n = this.initializationLifecycle, r = ha(t[0].params);
			n.begin(r);
			let i = [{
				...t[0],
				params: r
			}], a;
			try {
				a = this.sendBatch(Ea(i, Q, (e) => n.complete(e)));
			} catch (e) {
				throw n.fail(e), this.closeOnInitializationFailure?.(e), e;
			}
			return a.catch((e) => {
				n.status !== "initialized" && (n.fail(e), this.closeOnInitializationFailure?.(e));
			}), a;
		}
		return this.initializationLifecycle.waitUntilInitialized("batch").then(() => this.sendBatch(Ea(e, Q)));
	}
}, Na = class {
	connection;
	constructor(e) {
		this.connection = e;
	}
	get initialized() {
		return J(this.connection.getContext()).initialized;
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
}, Pa = class extends Na {
	connectHandlers;
	client;
	didStartConnectHandlers = !1;
	constructor(e, t = []) {
		super(e), this.connectHandlers = t, this.client = ja.create(e.getContext());
	}
	startConnectHandlers() {
		this.didStartConnectHandlers || (this.didStartConnectHandlers = !0, ro(this, this.connectHandlers));
	}
}, Fa = class extends Na {
	connectHandlers;
	agent;
	didStartConnectHandlers = !1;
	constructor(e, t = []) {
		super(e), this.connectHandlers = t, this.agent = Ma.create(e.getContext(), void 0, (t) => e.close(t));
	}
	startConnectHandlers() {
		this.didStartConnectHandlers || (this.didStartConnectHandlers = !0, ro(this, this.connectHandlers));
	}
};
function Ia(e, t = []) {
	return new Pa(e, t);
}
function La(e, t = []) {
	return new Fa(e, t);
}
var Ra = class {
	values = [];
	waiters = [];
	failed = !1;
	failure;
	nextSequence = 0;
	enqueue(e) {
		if (this.failed) return;
		let t = this.nextSequence++, n = this.waiters.shift();
		n ? n.resolve(e) : this.values.push({
			kind: "value",
			value: e,
			sequence: t
		});
	}
	reject(e) {
		if (this.failed) return;
		let t = this.nextSequence++;
		if (this.waiters.length > 0) {
			for (let t of this.waiters.splice(0)) t.reject(e);
			return;
		}
		this.values.push({
			kind: "error",
			error: e,
			sequence: t
		});
	}
	clearErrors() {
		this.values = this.values.filter((e) => e.kind === "value");
	}
	cursor() {
		return this.nextSequence;
	}
	nextAfter(e, t) {
		if (t?.aborted) return Promise.reject(t.reason);
		for (; this.values[0] && this.values[0].sequence < e;) this.values.shift();
		return this.next(t);
	}
	fail(e) {
		if (!this.failed) {
			this.failed = !0, this.failure = e;
			for (let t of this.waiters.splice(0)) t.reject(e);
		}
	}
	next(e) {
		if (e?.aborted) return Promise.reject(e.reason);
		if (this.values.length > 0) {
			let e = this.values.shift();
			return e.kind === "error" ? Promise.reject(e.error) : Promise.resolve(e.value);
		}
		return this.failed ? Promise.reject(this.failure) : new Promise((t, n) => {
			let r = () => {
				e?.removeEventListener("abort", a);
			}, i = {
				resolve: (e) => {
					r(), t(e);
				},
				reject: (e) => {
					r(), n(e);
				}
			}, a = () => {
				let t = this.waiters.indexOf(i);
				t >= 0 && this.waiters.splice(t, 1), i.reject(e?.reason);
			};
			this.waiters.push(i), e?.addEventListener("abort", a, { once: !0 }), e?.aborted && a();
		});
	}
};
function za(e) {
	return structuredClone(e);
}
var Ba = class e {
	cx;
	request;
	constructor(e, t) {
		this.cx = e, this.request = za(t);
	}
	static create(t, n) {
		return new e(t, n);
	}
	toRequest() {
		return za(this.request);
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
			mcpServers: [...this.request.mcpServers ?? [], structuredClone(e)]
		}, this;
	}
	async start(e) {
		return this.cx[ka](this.toRequest(), e);
	}
	async withSession(e) {
		let t = await this.start();
		try {
			return await e(t);
		} finally {
			t.dispose();
		}
	}
}, Va = class e {
	cx;
	sessionResponse;
	updates;
	registrations;
	latestPrompt;
	constructor(e, t, n, r) {
		this.cx = e, this.sessionResponse = t, this.updates = n, this.registrations = r;
	}
	static create(t, n, r, i) {
		return new e(t, n, r, i);
	}
	get sessionId() {
		return this.sessionResponse.sessionId;
	}
	get configOptions() {
		return this.sessionResponse.configOptions;
	}
	get meta() {
		return this.sessionResponse._meta;
	}
	get newSessionResponse() {
		return this.sessionResponse;
	}
	prompt(e, t) {
		this.updates.clearErrors();
		let n = this.updates.beginPrompt();
		this.latestPrompt = n;
		let r = this.cx.request(x.session_prompt, {
			sessionId: this.sessionId,
			prompt: this.promptBlocks(e)
		}, t);
		return r.catch((e) => {
			this.updates.cancelPrompt(n) && this.updates.reject(e);
		}), r;
	}
	nextUpdate() {
		return this.updates.next();
	}
	async readText() {
		let e = this.latestPrompt, t = e?.updateCursor, n = [], r = /* @__PURE__ */ new Map(), i = (e) => {
			let t = r.get(e);
			return t || (t = [], n.push(e), r.set(e, t)), t;
		};
		for (;;) {
			let a = t === void 0 ? await this.nextUpdate() : await this.updates.nextAfter(t, e?.overlapController.signal);
			if (a.kind === "stop") return n.flatMap((e) => r.get(e) ?? []).filter(ca.isText).map((e) => e.text).join("");
			let { update: o } = a;
			la.isAgentMessage(o) ? (i(o.messageId), o.content !== void 0 && r.set(o.messageId, o.content ?? [])) : la.isAgentMessageChunk(o) && i(o.messageId).push(o.content);
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
function Ha(e, t) {
	return e ? typeof e == "function" ? e(t) : e.parse(t) : t;
}
function X(e, t, n, r) {
	return {
		method: e,
		params: t,
		response: n,
		serializeResponse: r
	};
}
function Z(e, t) {
	return {
		method: e,
		params: t
	};
}
function Ua(e, t, n, r, i) {
	e.onReceiveRequest(t.method, (e) => Ha(t.params, e), async (e, a, o) => {
		try {
			let s = await r(n(e, o, a.signal, a.id)), c = t.serializeResponse ? t.serializeResponse(s) : s;
			await a.respond(c), i?.afterResponse(e, c, o);
		} catch (e) {
			throw i?.onError(o, e), e;
		}
	});
}
function Wa(e, t, n, r) {
	e.onReceiveNotification(t.method, (e) => Ha(t.params, e), (e, t) => r(n(e, t, t.signal)));
}
function Ga(e) {
	let t = Object.create(null);
	for (let n of Object.values(e)) t[n.method] = n;
	return t;
}
var Ka = {
	initialize: X(x.initialize, ma, ga, ga),
	loginAuth: X(x.auth_login, Fr, en, K),
	unstable_listProviders: X(x.providers_list, Ir, on),
	unstable_setProvider: X(x.providers_set, Lr, sn, K),
	unstable_disableProvider: X(x.providers_disable, Rr, cn, K),
	newSession: X(x.session_new, Gr, _n),
	setSessionConfigOption: X(x.session_set_config_option, $r, Tn),
	prompt: X(x.session_prompt, ei, En, K),
	unstable_messageMcp: X(x.mcp_message, ft, B),
	listSessions: X(x.session_list, Kr, bn),
	deleteSession: X(x.session_delete, qr, xn, K),
	unstable_forkSession: X(x.session_fork, Jr, Sn),
	resumeSession: X(x.session_resume, Zr, Cn),
	closeSession: X(x.session_close, Qr, wn, K),
	logoutAuth: X(x.auth_logout, zr, ln, K),
	unstable_startNes: X(x.nes_start, ri, Dn),
	unstable_suggestNes: X(x.nes_suggest, mi, Pn),
	unstable_closeNes: X(x.nes_close, hi, Fn, K)
}, qa = {
	cancelSession: Z(x.session_cancel, wi),
	unstable_messageMcp: Z(x.mcp_message, W),
	unstable_didOpenDocument: Z(x.document_did_open, Ti),
	unstable_didChangeDocument: Z(x.document_did_change, Di),
	unstable_didCloseDocument: Z(x.document_did_close, Oi),
	unstable_didSaveDocument: Z(x.document_did_save, ki),
	unstable_didFocusDocument: Z(x.document_did_focus, Ai),
	unstable_acceptNes: Z(x.nes_accept, ji),
	unstable_rejectNes: Z(x.nes_reject, Ni)
}, Ja = {
	requestPermission: X(S.session_request_permission, Ue, vi),
	unstable_connectMcp: X(S.mcp_connect, ut, Si),
	unstable_messageMcp: X(S.mcp_message, ft, B),
	unstable_disconnectMcp: X(S.mcp_disconnect, pt, Ci, K),
	createElicitation: X(S.elicitation_create, ct, xi)
}, Ya = {
	sessionUpdate: Z(S.session_update, xr),
	unstable_messageMcp: Z(S.mcp_message, W),
	completeElicitation: Z(S.elicitation_complete, Sr)
}, Q = Ga(Ka), Xa = Ga(qa), $ = Ga(Ja), Za = Ga(Ya);
function Qa(e, t, n, r) {
	return {
		params: e,
		requestId: r,
		signal: n,
		agent: t
	};
}
function $a(e, t, n) {
	return {
		params: e,
		signal: n,
		agent: t
	};
}
var eo = class {
	activeSessions = /* @__PURE__ */ new Map();
	handleMessage(e) {
		if (e.kind !== "notification" || e.method !== S.session_update) return p.no(e);
		let t = xr.parse(e.params), { update: n } = t, r = la.isStateUpdate(n) && ua.isIdle(n), i = this.activeSessions.get(t.sessionId);
		if (i && i.size > 0) for (let e of i) r && e.isAwaitingPromptCompletion() ? (e.completePrompt(), e.enqueue({
			kind: "stop",
			notification: t,
			update: n,
			stopReason: n.stopReason
		})) : e.enqueue({
			kind: "session_update",
			notification: t,
			update: n
		});
		return p.no(e);
	}
	attach(e, t) {
		let n = this.activeSessions.get(e.sessionId) ?? /* @__PURE__ */ new Set();
		return n.add(t), this.activeSessions.set(e.sessionId, n), new ee(() => {
			n.delete(t), n.size === 0 && this.activeSessions.delete(e.sessionId);
		});
	}
}, to = /* @__PURE__ */ new WeakMap();
function no(e) {
	let t = to.get(e);
	return t || (t = new eo(), to.set(e, t)), t;
}
function ro(e, t) {
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
var io = Symbol("appBuilder"), ao = Symbol("runAgentConnectHandlers"), oo = Symbol("runClientConnectHandlers");
function so(e, t) {
	e.closed.then(async () => {
		J(e.getContext()).status === "initialized" && await t.initialized.catch(() => {}), t.close(e.signal.reason);
	});
}
function co(e) {
	return new lo(e);
}
var lo = class {
	builder = ie.builder();
	connectHandlers = [];
	constructor(e = {}) {
		e.name && this.builder.name(e.name), this.builder.withHandler(wa()), this.builder.withHandler({
			handleMessage: (e, t) => no(t).handleMessage(e),
			describe: () => "client-session-update-router"
		});
	}
	[io]() {
		return this.builder;
	}
	[oo](e) {
		ro(e, this.connectHandlers);
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
		if (n) return fa(e, "request"), this.request({
			method: e,
			params: t
		}, n);
		let r = $[e];
		if (!r) throw Error(`Unknown ACP request method '${e}'. Pass a params parser for custom methods.`);
		return this.request(r, t);
	}
	onNotification(e, t, n) {
		if (n) return fa(e, "notification"), this.notification({
			method: e,
			params: t
		}, n);
		let r = Za[e];
		if (!r) throw Error(`Unknown ACP notification method '${e}'. Pass a params parser for custom methods.`);
		return this.notification(r, t);
	}
	request(e, t) {
		return Ua(this.builder, e, (e, t, n, r) => Qa(e, Ma.create(t, r), n, r), t), this;
	}
	notification(e, t) {
		return Wa(this.builder, e, (e, t, n) => $a(e, Ma.create(t), n), t), this;
	}
	connectConnection(e) {
		if (Da(e)) {
			let t = this.openStreamConnection(e);
			return this[oo](t.connection), t;
		}
		let [t, n] = Oa(), r = e[io]().connect(n), i = Ia(r), a = this.openStreamConnection(t);
		so(a.rawConnection, i), so(r, a.connection);
		try {
			e[ao](i), this[oo](a.connection);
		} catch (e) {
			throw i.close(e), a.connection.close(e), e;
		}
		return a;
	}
	openStreamConnection(e) {
		let t = this.builder.connect(e);
		return {
			rawConnection: t,
			connection: La(t, this.connectHandlers)
		};
	}
};
//#endregion
//#region src/core/protocol/v2.ts
async function uo(e) {
	let { sink: t } = e, n, r = co({ name: e.clientInfo.name }).onRequest(Y.client.session.requestPermission, async ({ params: e }) => {
		let n = e, r = await t.onPermission(e.sessionId, ho(n), n);
		return ue(r);
	}).onRequest(Y.client.elicitation.create, async ({ params: e }) => {
		let n = e, r = await t.onElicitation("sessionId" in e && typeof e.sessionId == "string" ? e.sessionId : void 0, te(n), n);
		return ae(r);
	}).onNotification(Y.client.session.update, ({ params: e }) => {
		t.onProtocol(Y.client.session.update, e), t.onUpdate(e.sessionId, e.update), n?.handleUpdate(e.sessionId, e.update);
	}).onNotification(Y.client.elicitation.complete, ({ params: e }) => {
		t.onProtocol(Y.client.elicitation.complete, e), t.onElicitationComplete(e.elicitationId);
	}).connect(e.stream), a = !1;
	r.closed.then(() => {
		n?.handleClose(), a || t.onDisconnect();
	});
	let o;
	try {
		o = await r.agent.request(Y.agent.initialize, {
			protocolVersion: 2,
			info: {
				name: e.clientInfo.name,
				version: e.clientInfo.version,
				...e.clientInfo.title ? { title: e.clientInfo.title } : {}
			},
			capabilities: {
				auth: { ...e.host?.terminalAuth ? { terminal: {} } : {} },
				elicitation: {
					form: {},
					url: {}
				}
			}
		});
	} catch (e) {
		throw r.close(e), new i("INITIALIZE_REJECTED", "ACP v2 initialization failed", {
			cause: e,
			protocol: 2,
			phase: "initialize",
			retryable: !0
		});
	}
	if (o.protocolVersion !== 2) throw r.close(), new i("PROTOCOL_VERSION_MISMATCH", `Requested ACP v2 but agent selected v${o.protocolVersion}`, {
		protocol: 2,
		phase: "initialize"
	});
	if (o.capabilities?.session == null) throw r.close(), new i("CAPABILITY_REQUIRED", "The ACP v2 agent does not advertise the session surface", {
		protocol: 2,
		phase: "initialize"
	});
	let s = o.capabilities.session;
	return n = new fo(r, {
		protocolVersion: 2,
		agentName: o.info.title ?? o.info.name,
		authMethods: ne(o.authMethods),
		capabilities: {
			listSessions: !0,
			loadSession: !0,
			resumeSession: !0,
			closeSession: !0,
			deleteSession: s.delete != null
		},
		promptCapabilities: {
			image: s.prompt?.image != null,
			audio: s.prompt?.audio != null,
			embeddedContext: s.prompt?.embeddedContext != null
		},
		additionalDirectories: s.additionalDirectories != null,
		mcp: {
			stdio: s.mcp?.stdio != null,
			http: s.mcp?.http != null,
			sse: !1
		}
	}, e.host, () => {
		a = !0;
	}), n;
}
var fo = class {
	connection;
	initialized;
	host;
	markClosed;
	version = 2;
	#e;
	constructor(e, t, n, r) {
		this.connection = e, this.initialized = t, this.host = n, this.markClosed = r;
	}
	async newSession(e) {
		le(e, this.initialized, 2, "session/new");
		let t = await de(() => this.connection.agent.request(Y.agent.session.new, po(e)), 2, "session/new");
		return {
			sessionId: t.sessionId,
			configOptions: re(t.configOptions)
		};
	}
	async openSession(e, t, n) {
		le(t, this.initialized, 2, "session/open");
		let r = await de(() => this.connection.agent.request(Y.agent.session.resume, {
			...po(t),
			sessionId: e,
			...n === "all" ? { replayFrom: { type: "start" } } : {}
		}), 2, "session/open");
		return {
			sessionId: e,
			configOptions: re(r.configOptions)
		};
	}
	async listSessions(e, t) {
		let n = await this.connection.agent.request(Y.agent.session.list, {
			cwd: e,
			...t ? { cursor: t } : {}
		});
		return se(n);
	}
	async deleteSession(e) {
		if (!this.initialized.capabilities.deleteSession) throw new i("CAPABILITY_REQUIRED", "The agent does not support session/delete", { protocol: 2 });
		await this.connection.agent.request(Y.agent.session.delete, { sessionId: e });
	}
	async closeSession(e) {
		await this.connection.agent.request(Y.agent.session.close, { sessionId: e });
	}
	async prompt(e, t, n) {
		if (this.#e) throw new i("SESSION_BUSY", "Only one foreground turn is supported", { protocol: 2 });
		let r, a, o = new Promise((e, t) => {
			r = e, a = t;
		});
		this.#e = {
			sessionId: e,
			accepted: !1,
			promise: o,
			resolve: r,
			reject: a
		};
		try {
			let r = this.connection.agent.request(Y.agent.session.prompt, {
				sessionId: e,
				prompt: t
			});
			return this.#e && (this.#e.accepted = !0), n(), await r, await o;
		} catch (e) {
			throw this.#e?.promise === o && (this.#e = void 0), e;
		}
	}
	async cancel(e) {
		await this.connection.agent.notify(Y.agent.session.cancel, { sessionId: e });
		let t = this.#e;
		!t || t.sessionId !== e || (this.#e = void 0, t.resolve("cancelled"));
	}
	async setConfigOption(e, t, n) {
		let r = await this.connection.agent.request(Y.agent.session.setConfigOption, {
			sessionId: e,
			configId: t,
			type: typeof n == "boolean" ? "boolean" : "id",
			value: n
		});
		return re(r.configOptions);
	}
	async authenticate(e) {
		if (e.type === "terminal") {
			if (!this.host?.terminalAuth) throw new i("CAPABILITY_REQUIRED", "Terminal authentication needs a host handler", { protocol: 2 });
			await this.host.terminalAuth(e);
			return;
		}
		await this.connection.agent.request(Y.agent.auth.login, { methodId: e.id });
	}
	async logout() {
		await this.connection.agent.request(Y.agent.auth.logout, {});
	}
	handleUpdate(e, t) {
		if (!this.#e || this.#e.sessionId !== e || !fe(t) || t.sessionUpdate !== "state_update" || t.state !== "idle") return;
		let n = this.#e;
		this.#e = void 0, n.resolve(oe(t.stopReason) ?? "end_turn");
	}
	handleClose() {
		if (!this.#e) return;
		let e = this.#e;
		this.#e = void 0, e.reject(new i("TURN_INTERRUPTED", "Connection closed before the turn completed", {
			protocol: 2,
			phase: "prompt",
			retryable: !0,
			accepted: e.accepted,
			completionUnknown: e.accepted
		}));
	}
	async close(e) {
		this.markClosed(), this.handleClose(), this.connection.close(e), await this.connection.closed;
	}
};
function po(e) {
	return {
		cwd: e.cwd,
		...e.additionalDirectories?.length ? { additionalDirectories: [...e.additionalDirectories] } : {},
		...e.mcpServers?.length ? { mcpServers: e.mcpServers.map(mo) } : {}
	};
}
function mo(e) {
	if (e.type === "sse") throw new i("INVALID_CONFIGURATION", "SSE MCP servers are not part of ACP v2", { protocol: 2 });
	return e.type === "stdio" ? {
		type: "stdio",
		name: e.name,
		command: e.command,
		...e.args?.length ? { args: [...e.args] } : {},
		...e.env?.length ? { env: [...e.env] } : {}
	} : {
		type: "http",
		name: e.name,
		url: e.url,
		...e.headers?.length ? { headers: [...e.headers] } : {}
	};
}
function ho(e) {
	let t = fe(e) ? e : {}, n = oe(t.description);
	return {
		type: "permission",
		title: oe(t.title) ?? "Permission required",
		...n ? { description: n } : {},
		options: ce(t.options)
	};
}
//#endregion
export { uo as connectV2 };

//# sourceMappingURL=v2.js.map