import * as React from 'react'
import { connect } from 'react-redux';

import keymapManager from '../../keymap-manager'
import { PhotoType } from '../../models/photo'
import AppState from '../../reducers/AppState'
import Picture from './Picture'


interface ConnectProps {
    isActive: boolean
    actions: any
}

interface Props extends ConnectProps {
    current: number
    highlighted: number[]
    photos: PhotoType[]
}

class Grid extends React.Component<Props, undefined> {

  constructor(props) {
    super(props);

    this.pressedEnter = this.pressedEnter.bind(this);
  }

  handleFlagging() {
    let flagSet = this.props.photos
      .filter((photo, i) => this.props.highlighted.indexOf(i) !== -1);

    this.props.actions.flagSet(this.props.photos, flagSet, true);
  }

  pressedEnter() {
    if (this.props.highlighted.length === 1)
      this.props.actions.setCurrent(this.props.highlighted[0]);
  }

  componentDidMount() {
    this.addListeners()
  }

  componentDidUpdate(prevProps, prevState) {
    const props = this.props
    if (props.isActive !== prevProps.isActive) {
      if (props.isActive) {
        this.addListeners()
      } else {
        this.removeListeners()
      }
    }
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  addListeners() {
    window.addEventListener('grid:left', this.props.actions.moveHighlightLeft);
    window.addEventListener('grid:right', this.props.actions.moveHighlightRight);
    window.addEventListener('grid:up', this.props.actions.moveHighlightUp);
    window.addEventListener('grid:down', this.props.actions.moveHighlightDown);
    window.addEventListener('grid:enter', this.pressedEnter);

    keymapManager.bind(this.refs.grid);
  }

  removeListeners() {
    window.removeEventListener('grid:left', this.props.actions.moveHighlightLeft);
    window.removeEventListener('grid:right', this.props.actions.moveHighlightRight);
    window.removeEventListener('grid:up', this.props.actions.moveHighlightUp);
    window.removeEventListener('grid:down', this.props.actions.moveHighlightDown);
    window.removeEventListener('grid:enter', this.pressedEnter);

    keymapManager.unbind();
  }

  render() {
    return (
      <div className="grid" ref="grid">
        {this.props.photos.map((photo, index) =>
          <Picture
            key={index}
            photoIndex={index}
            photo={photo}
            actions={this.props.actions}
            setFlagging={this.handleFlagging.bind(this)}
          />
        )}
      </div>
    );
  }
}

const ReduxGrid = connect<Props, {}, ConnectProps, AppState>((state, props) => ({
    ...props,
    current: state.current,
    highlighted: state.highlighted,
    photos: state.photos
}))(Grid);

export default ReduxGrid;
