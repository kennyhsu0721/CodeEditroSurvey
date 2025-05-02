import { EditorState } from "@codemirror/state";
import { EditorView, keymap, highlightSpecialChars, drawSelection } from "@codemirror/view";
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, indentRange } from "@codemirror/language";
import { history, historyKeymap } from "@codemirror/commands";
import { lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";

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
      javascript() // 支援 JS 語法
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
});