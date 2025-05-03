import { EditorState,StateEffect,StateField } from "@codemirror/state";
import { EditorView, keymap, highlightSpecialChars, drawSelection } from "@codemirror/view";
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, indentRange } from "@codemirror/language";
import { history, historyKeymap } from "@codemirror/commands";
import { lineNumbers, highlightActiveLineGutter,Decoration,ViewPlugin  } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";


  const setAnnotationsEffect = StateEffect.define();
  const setLineEffect = StateEffect.define();
  const setWidgetEffect = StateEffect.define();


  // 定義 StateField 來儲存 Decoration（標註資料）
  const annotationField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(deco, tr) {
      for (let e of tr.effects) {
        if (e.is(setAnnotationsEffect)) {
          return e.value;
        }
      }
      return deco.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
  });

  const lineField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(deco, tr) {
      for (let e of tr.effects) {
        if (e.is(setLineEffect)) return e.value;
      }
      return deco.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
  });

  const widgetField = StateField.define({
    create() {
      return Decoration.none;
    },
    update(deco, tr) {
      for (let e of tr.effects) {
        if (e.is(setWidgetEffect)) return e.value;
      }
      return deco.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
  });

const editor = new EditorView({
  state: EditorState.create({
    doc: ``,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap
      ]),
      javascript(),annotationField,lineField,widgetField // 支援 JS 語法
    ]
  }),
  parent: document.getElementById("editor")
});



$(document).ready(function () {

  $("#setCodeBtn").click(function (e) {
    e.preventDefault();



    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,  // 把整段內容清除
        insert: `function HelloWorld() {
  alert(Hello("World"))
}

function Hello(text) {
  alert("Hello "+text);
}`  // 你要的新內容
      }
    });

  });

  $("#getCodeBtn").click(function (e) {
    e.preventDefault();
    alert(editor.state.doc.toString())
  });

  $("#getSelectedSectionBtn").click(function (e) { 
    e.preventDefault();
    
    const selection = editor.state.selection;
    const from = selection.main.from;
    const to = selection.main.to;
  
    // 提取選中的文本
    alert(editor.state.doc.sliceString(from, to));

  });

  $("#getSelectedLineBtn").click(function (e) { 
    e.preventDefault();
    
    const selection = editor.state.selection;
    const from = selection.main.from;
    const to = selection.main.to;

    const fromLine = editor.state.doc.lineAt(from).number;
    const toLine = editor.state.doc.lineAt(to).number;
    
    alert('第'+fromLine.toString()+"行~第"+toLine.toString()+'行')
  });

  $("#getRangeBtn").click(function (e) { 
    e.preventDefault();
    
    const start = parseInt($("#startTxt").val());
    const end = parseInt($("#endTxt").val());


    const startPos = editor.state.doc.line(start).from;
    const endPos = editor.state.doc.line(end).to;

    const code = editor.state.doc.sliceString(startPos, endPos);
    debugger;
    alert(`從第 ${start} 行到第 ${end} 行的程式碼：${code}`);
  });

  $("#markCode").click(function (e) { 
    e.preventDefault();
    debugger

    const decoList = [];
    const deco = Decoration.mark({
      class: "cm-annotation",
      attributes: { title: "這段少了分號" }
    });

     decoList.push(deco.range(23,47));

     editor.dispatch({
      effects:setAnnotationsEffect.of(Decoration.set(decoList))
     })
    // const line = editor.state.doc.line(1);
    // const deco=Decoration.line({
    //   class:"cm-annotation",
    //   attributes: { "data-info": "提示文字" }
    // }).range(line.from);

    // editor.dispatch({
    //   effects: setLineEffect.of(Decoration.set([deco]))
    // });
  });

  $("#descCode").click(function (e) { 
    e.preventDefault();
    
    const deco = Decoration.widget({
      widget: {
        toDOM() {
          const el = document.createElement("div");
          el.textContent = "這行少了分號";
          el.style = "display:inline-block; margin-left:8px; color: gray; font-size: 0.9em;";
          el.style.background = '#fdf6e3';
          return el;
        },
        side: 1  // 插入右邊
      }
    }).range(47); // 插在 console 後

    editor.dispatch({
      effects: setWidgetEffect.of(Decoration.set([deco]))
    });

  });
});