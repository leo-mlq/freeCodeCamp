const projectName = 'drum-machine';
localStorage.setItem('example_project', 'Drum Machine');

const KeyInactive = {
  boxShadow: '2px 2px 5px red',
  color: 'red' };


const KeyActive = {
  boxShadow: '2px 2px 5px green',
  color: 'rgb(102, 252, 3)' };


const KeyNoPower = {
  boxShadow: '2px 2px 5px white',
  color: 'white' };


const KeyNoPowerPressed = {
  boxShadow: '2px 2px 5px black',
  color: 'white' };


const KeyRendered = props => {
  return (
    React.createElement("div", { className: "key", style: props.keyStyle, onClick: props.onClick },
    React.createElement("span", { className: "keyText" }, props.keySymbol)));


};

const bankOne = [{
  keyCode: 81,
  keyTrigger: 'Q',
  id: 'Heater-1',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3' },
{
  keyCode: 87,
  keyTrigger: 'W',
  id: 'Heater-2',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3' },
{
  keyCode: 69,
  keyTrigger: 'E',
  id: 'Heater-3',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3' },
{
  keyCode: 65,
  keyTrigger: 'A',
  id: 'Heater-4',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3' },
{
  keyCode: 83,
  keyTrigger: 'S',
  id: 'Clap',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3' },
{
  keyCode: 68,
  keyTrigger: 'D',
  id: 'Open-HH',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3' },
{
  keyCode: 90,
  keyTrigger: 'Z',
  id: "Kick-n'-Hat",
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3' },
{
  keyCode: 88,
  keyTrigger: 'X',
  id: 'Kick',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3' },
{
  keyCode: 67,
  keyTrigger: 'C',
  id: 'Closed-HH',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3' }];



const bankTwo = [{
  keyCode: 81,
  keyTrigger: 'Q',
  id: 'Chord-1',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3' },
{
  keyCode: 87,
  keyTrigger: 'W',
  id: 'Chord-2',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3' },
{
  keyCode: 69,
  keyTrigger: 'E',
  id: 'Chord-3',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3' },
{
  keyCode: 65,
  keyTrigger: 'A',
  id: 'Shaker',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3' },
{
  keyCode: 83,
  keyTrigger: 'S',
  id: 'Open-HH',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Dry_Ohh.mp3' },
{
  keyCode: 68,
  keyTrigger: 'D',
  id: 'Closed-HH',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3' },
{
  keyCode: 90,
  keyTrigger: 'Z',
  id: 'Punchy-Kick',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/punchy_kick_1.mp3' },
{
  keyCode: 88,
  keyTrigger: 'X',
  id: 'Side-Stick',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3' },
{
  keyCode: 67,
  keyTrigger: 'C',
  id: 'Snare',
  url: 'https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3' }];


class KeySingle extends React.Component {
  //TODO: props.keyCode props.keyName(for sound) props.powerOn
  constructor(props) {
    super(props);
    this.state = {
      keyState: this.props.powerOn ? KeyInactive : KeyNoPower };

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.keyActivation = this.keyActivation.bind(this);
  }
  handleClick() {
    this.setState({
      keyState: !this.props.powerOn ? this.state.keyState == KeyNoPower ? KeyNoPowerPressed : KeyNoPower : this.state.keyState == KeyInactive ? KeyActive : KeyInactive });

  }
  handleKeyPress(event) {
    if (event.keyCode === this.props.keyCodeFromBank) {
      this.keyActivation();

    }
  }
  keyActivation() {
    this.handleClick();
    setTimeout(() => this.handleClick(), 100);
    {/*figure out the correspondong sound*/}
    const sound = document.getElementById(this.props.clipId);

    if (this.props.powerOn) {
      sound.volume = this.props.clipVolume;
      sound.play();
      this.props.updateDisplay(this.props.clipId);
    }
    //console.log(this.props.powerOn);


  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
  //whenever parent powerOn changed, child keyPad should re-render
  //otherwise color wont switching.
  componentDidUpdate(prevProps) {
    if (this.props.powerOn != prevProps.powerOn) {
      this.setState({
        keyState: this.props.powerOn ? KeyInactive : KeyNoPower });

    }
  }
  /*
    componentWillReceiveProps(nextProps){
      this.setState({
        keyState: (this.props.powerOn)? KeyInactive: KeyNoPower,
      })
    }*/
  render() {
    //console.log(this.state.powerOn+' '+this.props.powerOn);
    return (

      //<KeyRendered keyStyle={this.state.keyState} keySymbol={this.props.keySymbol} onClick={this.keyActivation}/>
      React.createElement("div", { className: "key", style: this.state.keyState, onClick: this.keyActivation },
      React.createElement("span", { className: "keyText" }, this.props.keySymbol),
      React.createElement("audio", { class: "clip", id: this.props.clipId, src: this.props.src })));


  }}


class PadBank extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const KeyPads = this.props.bankNum.map((KeyItem) =>
    React.createElement(KeySingle, { keySymbol: KeyItem.keyTrigger, keyCodeFromBank: KeyItem.keyCode, powerOn: this.props.powerOn, clipVolume: this.props.clipVolume, clipId: KeyItem.id, src: KeyItem.url, updateDisplay: this.props.updateDisplay }));

    return (
      React.createElement("div", { id: "keyPads", className: "keyPads" },
      KeyPads));



  }}




class DrumMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      powerOn: false,
      displayText: '',
      bankNum: bankOne,
      clipVolume: 0.3 };

    this.handlePowerSwitch = this.handlePowerSwitch.bind(this);
    this.handleBankSwitch = this.handleBankSwitch.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.displayContent = this.displayContent.bind(this);
  }
  handlePowerSwitch() {
    this.setState({
      powerOn: !this.state.powerOn });

    //toggle opposite
    if (!this.state.powerOn) {
      this.displayContent('On');
    } else
    {
      this.displayContent('Off');
    }
    setTimeout(() => this.displayContent(' '), 1000);

  }
  handleBankSwitch() {

    if (this.state.powerOn) {

      this.state.bankNum === bankOne ? this.setState({
        bankNum: bankTwo,
        displayText: 'Smooth Piano Kit' }) : this.setState({
        bankNum: bankOne,
        displayText: 'Heater Kit' });
    }
  }
  handleVolumeChange(event) {
    if (this.state.powerOn) {
      this.setState({
        clipVolume: event.target.value });

      this.displayContent(Math.round(this.state.clipVolume * 100));
      setTimeout(() => this.displayContent(' '), 500);
    }

  }
  displayContent(inputText) {
    this.setState({
      displayText: inputText });

  }
  render() {
    const powerSwitchLoc = !this.state.powerOn ? { marginTop: '15px' } : { marginTop: '0px' };
    const bankSwitchLoc = this.state.bankNum === bankOne ? { marginTop: '15px' } : { marginTop: '0px' };
    const discoEffect = this.state.powerOn ? { animation: 'rainbow 0.3s infinite alternate' } : {};
    //console.log(this.state.powerOn);
    return (
      React.createElement("div", { id: "main", className: "main-container", style: discoEffect },

      React.createElement(PadBank, { id: "padBank", powerOn: this.state.powerOn, bankNum: this.state.bankNum, clipVolume: this.state.clipVolume, updateDisplay: this.displayContent }),
      React.createElement("div", { className: "controlPads", id: "controlPads" },
      React.createElement("div", { className: "displayScreen", id: "displayScreen" },
      React.createElement("span", { id: "displayText" }, this.state.displayText)),

      React.createElement("div", { className: "switch", id: "powerSwitch", onClick: this.handlePowerSwitch },
      React.createElement("div", { className: "switchKnot", id: "powerSwitchKnot", style: powerSwitchLoc })),

      React.createElement("div", { className: "switch", id: "bankSwitch", onClick: this.handleBankSwitch },
      React.createElement("div", { className: "switchKnot", id: "bankSwitchKnot", style: bankSwitchLoc })),

      React.createElement("input", { type: "range", min: "0", max: "1", step: "0.01", value: this.state.clipVolume, onChange: this.handleVolumeChange }),
      React.createElement("h5", { style: { color: 'white', marginLeft: '50px', fontFamily: 'Arial' } }, "Power  \xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0Bank \xA0\xA0\xA0\xA0\xA0Volume"))));




  }}

ReactDOM.render(React.createElement(DrumMachine, null), document.getElementById('drumMachine'));