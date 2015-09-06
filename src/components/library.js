import React from 'react';

//import Photo from './../models/photo';
import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import Picture from './picture';
import PictureDetail from './picture-detail';

class Library extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: [], current: null };
  }

  handleCurrent(photo) {
    var state = this.state;
    state.current = photo;
    this.setState(state);
  }

  handleLeftCurrent() {
    var state = this.state;

    if (state.photos.indexOf(state.current) >= 1) {
      state.current = state.photos[state.photos.indexOf(state.current) - 1];
      this.setState(state);
    }
  }

  handleRightCurrent() {
    var state = this.state;

    if (state.photos.length > state.photos.indexOf(state.current) + 1) {
      state.current = state.photos[state.photos.indexOf(state.current) + 1];
      this.setState(state);
    }
  }

  componentDidMount() {
    PhotoStore.listen(this.updatePhotos.bind(this));
    PhotoActions.getPhotos();
  }

  updatePhotos(store) {
    console.log('upd photos', store.photos );
    if (store.photos)
      this.setState({ photos: store.photos });
  }

  render() {
    let currentView;
    let handleCurrent = this.handleCurrent.bind(this);
    let handleLeftCurrent = this.handleLeftCurrent.bind(this);
    let handleRightCurrent = this.handleRightCurrent.bind(this);

    if (!this.state.current)
      currentView = this.state.photos.map(function(photo) {
        return (
          <Picture
            photo={photo}
            setCurrent={handleCurrent} />
        );
      });
    else
      currentView = <PictureDetail
                      photo={this.state.current}
                      setCurrent={handleCurrent}
                      setLeft={handleLeftCurrent}
                      setRight={handleRightCurrent} />

    return (
      <div id="library">
        {currentView}
      </div>
    );
  }
}

export default Library;
