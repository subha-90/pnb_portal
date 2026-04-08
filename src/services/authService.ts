import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

export const authConfig = {
  authority: 'https://pnb-auth-stage.isupay.in/application/o/pnb/',
  client_id: 'SaDG8kozoNOUC07Uv46et8',
  redirect_uri: 'http://localhost:3000/redirected',
  post_logout_redirect_uri: 'http://localhost:3000/',
  response_type: 'code',
  scope: 'openid profile email offline_access authorities privileges user_name created adminName bankCode goauthentik.io/api',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(authConfig);

export const login = () => userManager.signinRedirect();
export const logout = () => userManager.signoutRedirect();
export const getUser = () => userManager.getUser();
export const signinCallback = () => userManager.signinCallback();
