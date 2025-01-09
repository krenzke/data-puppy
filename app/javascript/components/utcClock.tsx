import React from "react";

interface Props {}
interface State {
  time: Date;
}

export default class UTCClock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      time: new Date()
    };
    setTimeout(() => this.updateTime(), 1000);
  }

  updateTime = () => {
    this.setState({ time: new Date() });
    setTimeout(() => this.updateTime(), 1000);
  };

  render() {
    const { time } = this.state;
    return <span>{time.toUTCString()}</span>;
  }
}
