//https://numb86-tech.hatenablog.com/entry/2019/06/28/22
/* npm uninstall パッケージしてから再度インストールする */

class Meuront {

    mountId;
    vDomTreeBefore;
    vDomTreeAfter;
    /* 値がインスタンスで共通するのでクラス変数にするべき？ */
    static events = {
        "onClick": "click",
        "onKeyUp": "keyup"
    }

    constructor(component) {

        this.mountId = component.mountId;
        this.vDomTreeBefore = component.elements;
        this.vDomTreeAfter = JSON.parse(JSON.stringify(this.vDomTreeBefore));
        //this.render(this.vDomTreeBefore, true);
    }
    
    render(obj, root) {

        var ele = document.createElement(obj.tag);

        Object.keys(obj.attributes).forEach((key) => {
            if (Object.keys(Meuront.events).indexOf(key) != -1) {
                ele.addEventListener(Meuront.events[[key]], obj.attributes[[key]]);
            } else {
                ele.setAttribute(key, obj.attributes[[key]]);
            }
        });
            
        obj.children.forEach((child) => {
            if (typeof child == "object") {
                ele.appendChild(this.render(child, false));
            } else {
                ele.appendChild(document.createTextNode(child));
            }
        });

        if (root == true) {
            document.getElementById(this.mountId).appendChild(ele);
        }

        return ele;

    }

    compareDifferences(vNodeBefore, vNodeAfter) {

        if (typeof vNodeBefore !== "object" && vNodeBefore !== vNodeAfter) {
            return console.log(vNodeAfter);
        }

        /* ネストされているオブジェクトを文字列化すると中身が[Array]や[Object]といった形で省略されてしまい比較ができない */
        /* なのでvNodeBefore(After)を丸々文字列化するのではなく要素ごとに文字列化する */
        
        /* 変更前と変更後で同じノードが存在していても、位置が異なる場合は差分が発生した(新しく追加した要素)とみなす。 */
        /* before => ["こんにちは", "さようなら"] after => ["さようなら", "こんにちは"]  ==>  "さようなら"と"こんにちは"を新しいテキストノードとして追加(元のは破棄)
        /* before => ["こんにちは", "さようなら"] after => ["こんにちは", "ああああ", "さようなら"]　==>　"ああああ"と"さようなら"を新しいテキストノードとして追加(元のは破棄) */

        if (vNodeBefore.tag !== vNodeAfter.tag || JSON.stringify(vNodeBefore.attributes) !== JSON.stringify(vNodeAfter.attributes)) {
            console.log("差分", vNodeBefore.tag, vNodeBefore.attributes, vNodeAfter.tag, vNodeAfter.attributes);
        } 

        vNodeBefore.children.forEach((child, index) => {
            this.compareDifferences(child, vNodeAfter.children[index]);
        });

        /* 新しく追加されたノードをレンダリング */
        if (vNodeBefore.children.length < vNodeAfter.children.length) {
            console.log(vNodeAfter.children.slice(vNodeAfter.children.length - vNodeBefore.children.length));
        }

    }

    /* ライフサイクル関数 */

}

module.exports = Meuront;


var App = new Meuront({
    mountId: "app", 
    elements: {
        tag: "div", attributes: {}, children: [
            {tag: "input", attributes: {type: "text", onKeyUp: (e) => keyUpFunc(e)}, children: []},
            {tag: "input", attributes: {type: "button", value: "押せ!", onClick: (e) => clickFunc(e)}, children: []},
            {tag: "span", attributes: {class: "message"}, children: [
               "こんにちは"
            ]}
        ]
    },
}); 

App.vDomTreeAfter.children[2].children[0] = "さっさと帰りやがれ";
App.vDomTreeAfter.children[2].children.push("このクソ野郎");
App.compareDifferences(App.vDomTreeBefore, App.vDomTreeAfter);
