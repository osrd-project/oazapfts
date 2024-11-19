import { ok } from '../';
export type RequestOpts = {
  baseUrl?: string;
  fetch?: typeof fetch;
  formDataConstructor?: new () => FormData;
  headers?: Record<string, string | number | boolean | undefined>;
} & Omit<RequestInit, 'body' | 'headers'>;
type FetchRequestOpts = RequestOpts & {
  body?: string | FormData | Blob;
};
type JsonRequestOpts = RequestOpts & {
  body?: any;
};
type FormRequestOpts = RequestOpts & {
  body?: Record<string, any>;
};
export type ApiResponse = {
  status: number;
  data?: any;
};
export type WithHeaders<T extends ApiResponse> = T & {
  headers: Headers;
};
type MultipartRequestOpts = RequestOpts & {
  body?: Record<string, unknown>;
};
export declare function runtime(defaults: RequestOpts): {
  ok: typeof ok;
  fetchText: (
    url: string,
    req?: FetchRequestOpts,
  ) => Promise<{
    status: number;
    headers: Headers;
    contentType: string | null;
    data: string | undefined;
  }>;
  fetchJson: <T extends ApiResponse>(
    url: string,
    req?: FetchRequestOpts,
  ) => Promise<WithHeaders<T>>;
  fetchBlob: <T_1 extends ApiResponse>(
    url: string,
    req?: FetchRequestOpts,
  ) => Promise<WithHeaders<T_1>>;
  json({ body, headers, ...req }: JsonRequestOpts): {
    headers: {
      'Content-Type': string;
    };
    body?: string | undefined;
    baseUrl?: string | undefined;
    fetch?: typeof fetch | undefined;
    formDataConstructor?: (new () => FormData) | undefined;
    cache?: RequestCache | undefined;
    credentials?: RequestCredentials | undefined;
    integrity?: string | undefined;
    keepalive?: boolean | undefined;
    method?: string | undefined;
    mode?: RequestMode | undefined;
    redirect?: RequestRedirect | undefined;
    referrer?: string | undefined;
    referrerPolicy?: ReferrerPolicy | undefined;
    signal?: AbortSignal | null | undefined;
    window?: null | undefined;
  };
  form({ body, headers, ...req }: FormRequestOpts): {
    headers: {
      'Content-Type': string;
    };
    body?: string | undefined;
    baseUrl?: string | undefined;
    fetch?: typeof fetch | undefined;
    formDataConstructor?: (new () => FormData) | undefined;
    cache?: RequestCache | undefined;
    credentials?: RequestCredentials | undefined;
    integrity?: string | undefined;
    keepalive?: boolean | undefined;
    method?: string | undefined;
    mode?: RequestMode | undefined;
    redirect?: RequestRedirect | undefined;
    referrer?: string | undefined;
    referrerPolicy?: ReferrerPolicy | undefined;
    signal?: AbortSignal | null | undefined;
    window?: null | undefined;
  };
  multipart({ body, headers, ...req }: MultipartRequestOpts):
    | {
        baseUrl?: string | undefined;
        fetch?: typeof fetch | undefined;
        formDataConstructor?: (new () => FormData) | undefined;
        cache?: RequestCache | undefined;
        credentials?: RequestCredentials | undefined;
        integrity?: string | undefined;
        keepalive?: boolean | undefined;
        method?: string | undefined;
        mode?: RequestMode | undefined;
        redirect?: RequestRedirect | undefined;
        referrer?: string | undefined;
        referrerPolicy?: ReferrerPolicy | undefined;
        signal?: AbortSignal | null | undefined;
        window?: null | undefined;
      }
    | {
        body: FormData;
        headers: {
          'Content-Type': string;
        };
        baseUrl?: string | undefined;
        fetch?: typeof fetch | undefined;
        formDataConstructor?: (new () => FormData) | undefined;
        cache?: RequestCache | undefined;
        credentials?: RequestCredentials | undefined;
        integrity?: string | undefined;
        keepalive?: boolean | undefined;
        method?: string | undefined;
        mode?: RequestMode | undefined;
        redirect?: RequestRedirect | undefined;
        referrer?: string | undefined;
        referrerPolicy?: ReferrerPolicy | undefined;
        signal?: AbortSignal | null | undefined;
        window?: null | undefined;
      };
};
export {};