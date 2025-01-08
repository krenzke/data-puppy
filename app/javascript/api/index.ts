import * as qs from "qs";

export interface PaginationArgs {
  page?: number;
  perPage?: number;
}

export interface PaginationData {
  curr_page: number;
  max_page: number;
  next_page: number | null;
  prev_page: number | null;
  per_page: number;
  record_count: number;
}

export interface ResourceIdentifier {
  id: string;
  type: string;
}

export interface ApiErrorRecord {
  id?: string;
  links?: string;
  status?: number;
  code: string;
  title?: string;
  detail?: string;
  source?: string;
  meta?: any;
}

export interface ApiAttributeErrorRecord extends ApiErrorRecord {
  meta: {
    attribute: string;
  };
}

export interface ErrorResponse {
  errors: ApiErrorRecord[];
}

export function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj.errors !== undefined && Array.isArray(obj.errors);
}

export function isApiAttributeErrorRecord(
  obj: any
): obj is ApiAttributeErrorRecord {
  return obj.meta !== undefined && typeof obj.meta.attribute === "string";
}

export function encodeParams(q: any): string {
  return qs.stringify(q, {
    arrayFormat: "brackets",
    encoder: encoder,
  });
}

function encoder(
  str: string,
  defaultEncoder: (s: string) => string,
  _charset: string,
  type: "key" | "value"
): string {
  if (type === "key") {
    return transformQueryKey(str);
  } else {
    return defaultEncoder(str);
  }
}

const KeyMap: { [key: string]: string } = {
  perPage: "per_page",
  "categoryIds[]": "category_ids[]",
};

function transformQueryKey(k: string) {
  return KeyMap[k] || k;
}

export const API_PREFIX = import.meta.env.PROD ? "/data-puppy" : "";

export const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};
