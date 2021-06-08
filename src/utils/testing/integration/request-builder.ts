/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import fetch, { Response } from 'node-fetch';

export class TestRequestBuilder {

    private cookies: string;

    async post(url: string, body: any = {}, options: RequestOptions = {}): Promise<Response> {
        return this.base('post', url, options, body);
    }
    
    async delete(url: string, options: RequestOptions = {}): Promise<Response> {
        return this.base('delete', url, options);
    }

    async get(url: string, options: RequestOptions = {}): Promise<Response> {
        return this.base('get', url, options);
    }

    async patch(url: string, body: any = {}, options: RequestOptions = {}) {
        return this.base('patch', url, options, body);
    }
    
    private async base(method: string, url: string, options: RequestOptions, body: any = null): Promise<Response> {
        if (options.writeDebugLogs) {
            console.log('REQUEST METHOD', method);
            console.log('REQUEST URL', url);
            console.log('REQUEST BODY', body);
            console.log('COOKIES', this.cookies);
        }
        const res = await fetch(url, {
            method,
            headers: {
                'content-type': 'application/json',
                Cookie: options.disableCookies || !this.cookies ? '' : this.cookies,
                ...options.headers
            },
            body: body ? JSON.stringify(body) : null
        });
        this.cookies = options.disableCookies || !res.headers.get('Set-Cookie') ? this.cookies : res.headers.get('Set-Cookie');
        if (options.writeDebugLogs) {
            console.log('RESPONSE STATUS', res.status);
            console.log('RESPONSE STATUS TEXT', res.statusText);
            try {
                console.log('RESPONSE BODY', await res.json());
            } catch {}
        }
        return res;
    }   
}

export interface RequestOptions {
    headers?: { [key: string]: any };
    disableCookies?: boolean;
    writeDebugLogs?: boolean;
}
