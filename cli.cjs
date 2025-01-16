#!/usr/bin/env node
"use strict";var a=(r,i,t)=>new Promise((n,u)=>{var d=e=>{try{c(t.next(e))}catch(l){u(l)}},p=e=>{try{c(t.throw(e))}catch(l){u(l)}},c=e=>e.done?n(e.value):Promise.resolve(e.value).then(d,p);c((t=t.apply(r,i)).next())});const y=require("fs"),f=require("minimist"),o=require("./index.cjs"),g=f(process.argv.slice(2),{alias:{i:"include",e:"exclude"},boolean:["optimistic","useEnumType","mergeReadWriteOnly"],string:["argumentStyle"]});function S(r,i,t){return a(this,null,function*(){const n=yield o.generateSource(r,t);i?y.writeFileSync(i,n):console.log(n)})}const{include:x,exclude:b,optimistic:v,useEnumType:O,mergeReadWriteOnly:q,argumentStyle:s}=g,[m,A]=g._;m||(console.error(`
    Usage:
    oazapfts <spec> [filename]

    Options:
    --exclude, -e <tag to exclude>
    --include, -i <tag to include>
    --optimistic
    --useEnumType
    --mergeReadWriteOnly
    --argumentStyle=<${o.optsArgumentStyles.join(" | ")}> (default: positional)
`),process.exit(1));s!==void 0&&!o.optsArgumentStyles.includes(s)&&(console.error(`--argumentStyle should be one of <${o.optsArgumentStyles.join(" | ")}>, but got "${s}"`),process.exit(1));S(m,A,{include:x,exclude:b,optimistic:v,useEnumType:O,mergeReadWriteOnly:q,argumentStyle:s});
//# sourceMappingURL=cli.cjs.map
