const projectName = "markdown-previewer";
localStorage.setItem('example_project', 'Markdown Previewer');

const markdownTest = `# Welcome to my React Markdown Previewer!

## This is a sub-heading...
### And here's some other cool stuff:
  
Heres some code, \`<div></div>\`, between 2 backticks.

\`\`\`
// this is multi-line code:

function anotherExample(firstLine, lastLine) {
  if (firstLine == '\`\`\`' && lastLine == '\`\`\`') {
    return multiLineCode;
  }
}
\`\`\`
  
You can also make text **bold**... whoa!
Or _italic_.
Or... wait for it... **_both!_**
And feel free to go crazy ~~crossing stuff out~~.

There's also [links](https://www.freecodecamp.com), and
> Block Quotes!

And if you want to get really crazy, even tables:

Wild Header | Crazy Header | Another Header?
------------ | ------------- | ------------- 
Your content can | be here, and it | can be here....
And here. | Okay. | I think we get it.

- And of course there are lists.
  - Some are bulleted.
     - With different indentation levels.
        - That look like this.


1. And there are numbererd lists too.
1. Use just 1s if you want! 
1. But the list goes on...
- Even if you use dashes or asterisks.
* And last but not least, let's not forget embedded images:

![React Logo w/ Text](https://goo.gl/Umyytc)
`;

marked.setOptions({
  gfm: true,
  renderer: new marked.Renderer(),
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: false,
  smartypants: false });


const renderer = new marked.Renderer();

class Markdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: markdownTest,
      editorMax: false,
      previewerMax: false };

    this.handleChange = this.handleChange.bind(this);
    this.handleEditorMax = this.handleEditorMax.bind(this);
    this.handlePreviewerMax = this.handlePreviewerMax.bind(this);
  }
  handleChange(event) {
    this.setState({
      input: event.target.value });

  }
  handleEditorMax() {
    this.setState({
      editorMax: !this.state.editorMax });

  }
  handlePreviewerMax() {
    this.setState({
      previewerMax: !this.state.previewerMax });

  }
  render() {
    let setting = this.state.editorMax ?
    ['editorContainer maximized', 'previewerContainer minimized', 'fa fa-compress'] : this.state.previewerMax ? ['editorContainer minimized', 'previewerContainer maximized', 'fa fa-compress'] : ['editorContainer', 'previewerContainer', 'fa fa-arrows-alt'];
    return (
      React.createElement("div", null,
      React.createElement("h1", { className: "title" }, "Markdown Previewer"),
      React.createElement("div", { className: "wrapper" },
      React.createElement("div", { className: setting[0] },
      React.createElement(Toolbar, { text: "Editor", icon: setting[2], onClick: this.handleEditorMax }),
      React.createElement(Editor, { value: this.state.input, onChange: this.handleChange })),

      React.createElement("div", { className: setting[1] },
      React.createElement(Toolbar, { text: "Previewer", icon: setting[2], onClick: this.handlePreviewerMax }),
      React.createElement(Previewer, { markdown: this.state.input })))));




  }}
;

const Toolbar = props => {
  return (
    React.createElement("div", { className: "toolbar" },
    React.createElement("span", null, props.text),
    React.createElement("i", { onClick: props.onClick, className: props.icon })));


};

const Editor = props => {
  return (
    React.createElement("textarea", { id: "editor", value: props.value, onChange: props.onChange, type: "text" }));

};

class Previewer extends React.Component {
  constructor(props) {
    super(props);
  }
  getMarkdownText() {
    var rawMarkup = marked(this.props.markdown, { renderer: renderer });
    return { __html: rawMarkup };
  }
  render() {
    return React.createElement("div", { id: "preview", dangerouslySetInnerHTML: this.getMarkdownText() });
  }}


ReactDOM.render(React.createElement(Markdown, null), document.getElementById('markdown'));