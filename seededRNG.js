// http://davidbau.com/encode/seedrandom.js

/*

	LICENSE (MIT)
	-------------

	Copyright 2014 David Bau.

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function(e,t,n,r,i,s,o,u,a){function d(e){var t,n=e.length,i=this,s=0,o=i.i=i.j=0,u=i.S=[];if(!n){e=[n++]}while(s<r){u[s]=s++}for(s=0;s<r;s++){u[s]=u[o=h&o+e[s%n]+(t=u[s])];u[o]=t}(i.g=function(e){var t,n=0,s=i.i,o=i.j,u=i.S;while(e--){t=u[s=h&s+1];n=n*r+u[h&(u[s]=u[o=h&o+t])+(u[o]=t)]}i.i=s;i.j=o;return n})(r)}function v(e,t){var n=[],r=(typeof e)[0],i;if(t&&r=="o"){for(i in e){try{n.push(v(e[i],t-1))}catch(s){}}}return n.length?n:r=="s"?e:e+"\0"}function m(e,t){var n=e+"",r,i=0;while(i<n.length){t[h&i]=h&(r^=t[h&i]*19)+n.charCodeAt(i++)}return y(t)}function g(n){try{e.crypto.getRandomValues(n=new Uint8Array(r));return y(n)}catch(i){return[+(new Date),e,(n=e.navigator)&&n.plugins,e.screen,y(t)]}}function y(e){return String.fromCharCode.apply(0,e)}var f=n.pow(r,i),l=n.pow(2,s),c=l*2,h=r-1,p=n["seed"+a]=function(e,s,o){var u=[];var h=m(v(s?[e,y(t)]:e===null||e===undefined?g():e,3),u);var p=new d(u);m(y(p.S),t);return(o||function(e,t,r){if(r){n[a]=e;return t}else return e})(function(){var e=p.g(i),t=f,n=0;while(e<l){e=(e+n)*r;t*=r;n=p.g(1)}while(e>=c){e/=2;t/=2;n>>>=1}return(e+n)/t},h,this==n)};m(n[a](),t);if(o&&o.exports){o.exports=p}else if(u&&u.amd){u(function(){return p})}})(this,[],Math,256,6,52,(typeof module)[0]=="o"&&module,(typeof define)[0]=="f"&&define,"random")