import {
  $ as e,
  C as t,
  D as n,
  J as r,
  K as i,
  S as a,
  T as o,
  b as s,
  g as c,
  n as l,
  nt as u,
  p as d,
  w as f,
  z as p,
} from "./auth.js";
import { i as m, n as h, r as g } from "./index.js";
var _ = {
    class: `min-h-screen flex items-center justify-center bg-gray-950 px-4`,
  },
  v = {
    class: `max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-10 relative overflow-hidden`,
  },
  y = {
    key: 0,
    class: `text-red-400 text-xs py-3 px-4 bg-red-900/10 rounded-xl border border-red-900/20 animate-shake`,
  },
  b = [`disabled`],
  x = {
    key: 0,
    class: `animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3`,
  },
  S = { class: `text-center text-[10px] text-gray-600 mt-8 font-medium` },
  C = h(
    n({
      __name: `SetupView`,
      setup(n) {
        let h = m(),
          C = l(),
          w = r(`admin`),
          T = r(``),
          E = r(``),
          D = r(``),
          O = r(!1),
          k = async () => {
            if (T.value !== E.value) {
              D.value = `两次输入的密码不一致`;
              return;
            }
            if (T.value.length < 6) {
              D.value = `密码长度至少为 6 位`;
              return;
            }
            ((D.value = ``), (O.value = !0));
            try {
              (await C.setup(w.value, T.value), h.push(`/login`));
            } catch (e) {
              D.value = e.response?.data?.message || `初始化失败`;
            } finally {
              O.value = !1;
            }
          };
        return (n, r) => (
          p(),
          t(`div`, _, [
            s(`div`, v, [
              (r[6] ||= f(
                `<div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full" data-v-f26ec6a5></div><div class="text-center mb-8 relative z-10" data-v-f26ec6a5><div class="flex justify-center mb-6" data-v-f26ec6a5><div class="w-16 h-16 bg-blue-600/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 border border-blue-500/20 shadow-lg" data-v-f26ec6a5><img src="/assets/logo.png" alt="Logo" class="w-full h-full object-contain" data-v-f26ec6a5></div></div><h1 class="text-3xl font-bold text-white mb-2 tracking-tight" data-v-f26ec6a5>HomeOS</h1><div class="flex items-center justify-center gap-2 mb-4" data-v-f26ec6a5><span class="h-px w-8 bg-blue-500/30" data-v-f26ec6a5></span><span class="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]" data-v-f26ec6a5>首次运行引导</span><span class="h-px w-8 bg-blue-500/30" data-v-f26ec6a5></span></div><p class="text-gray-400 text-sm leading-relaxed" data-v-f26ec6a5>由于这是您首次部署该系统，请设置最高权限管理员账号。</p></div>`,
                2,
              )),
              s(
                `form`,
                {
                  onSubmit: c(k, [`prevent`]),
                  class: `space-y-5 relative z-10`,
                },
                [
                  s(`div`, null, [
                    (r[3] ||= s(
                      `label`,
                      {
                        for: `username`,
                        class: `block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1`,
                      },
                      `管理员账号`,
                      -1,
                    )),
                    i(
                      s(
                        `input`,
                        {
                          id: `username`,
                          name: `username`,
                          "onUpdate:modelValue": (r[0] ||= (e) =>
                            (w.value = e)),
                          type: `text`,
                          autocomplete: `username`,
                          class: `w-full bg-gray-800/50 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium`,
                          placeholder: `例如: admin`,
                          required: ``,
                        },
                        null,
                        512,
                      ),
                      [[d, w.value]],
                    ),
                  ]),
                  s(`div`, null, [
                    (r[4] ||= s(
                      `label`,
                      {
                        for: `password`,
                        class: `block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1`,
                      },
                      `设置密码`,
                      -1,
                    )),
                    i(
                      s(
                        `input`,
                        {
                          id: `password`,
                          name: `password`,
                          "onUpdate:modelValue": (r[1] ||= (e) =>
                            (T.value = e)),
                          type: `password`,
                          autocomplete: `new-password`,
                          class: `w-full bg-gray-800/50 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium`,
                          placeholder: `••••••••`,
                          required: ``,
                        },
                        null,
                        512,
                      ),
                      [[d, T.value]],
                    ),
                  ]),
                  s(`div`, null, [
                    (r[5] ||= s(
                      `label`,
                      {
                        for: `confirm`,
                        class: `block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1`,
                      },
                      `确认密码`,
                      -1,
                    )),
                    i(
                      s(
                        `input`,
                        {
                          id: `confirm`,
                          "onUpdate:modelValue": (r[2] ||= (e) =>
                            (E.value = e)),
                          type: `password`,
                          autocomplete: `new-password`,
                          class: `w-full bg-gray-800/50 border border-white/5 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium`,
                          placeholder: `••••••••`,
                          required: ``,
                        },
                        null,
                        512,
                      ),
                      [[d, E.value]],
                    ),
                  ]),
                  D.value ? (p(), t(`div`, y, u(D.value), 1)) : a(``, !0),
                  s(
                    `button`,
                    {
                      type: `submit`,
                      disabled: O.value,
                      class: `w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-4 py-4 transition-all flex justify-center items-center shadow-lg shadow-blue-600/20 active:scale-[0.98]`,
                    },
                    [
                      O.value ? (p(), t(`span`, x)) : a(``, !0),
                      o(
                        ` ` +
                          u(O.value ? `正在初始化...` : `完成部署并进入系统`),
                        1,
                      ),
                    ],
                    8,
                    b,
                  ),
                ],
                32,
              ),
              s(`p`, S, `HomeOS ` + u(e(g)) + ` | 全屋智能控制中台`, 1),
            ]),
          ])
        );
      },
    }),
    [[`__scopeId`, `data-v-f26ec6a5`]],
  );
export { C as default };
