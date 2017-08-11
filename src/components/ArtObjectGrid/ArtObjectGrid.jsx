import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ObjectsActions from '../../actions/objects';
import * as ObjectActions from '../../actions/object';

import ArtObject from '../ArtObject/ArtObject';
import ViewMoreButton from './ViewMoreButton';

import './artObjectGrid.css';

class ArtObjectGrid extends Component {
  constructor(props) {
    super(props);
    this.setHistory = this.setHistory.bind(this);
  }

  componentDidMount() {
    if (this.props.objects.length === 0) {
      this.props.getAllObjects();
    }
  }

  setHistory(objectId) {
    this.props.history.push(`/objects/${objectId}/`);
  }

  render() {
    const { objects } = this.props;

    return (
      <div>
        {objects.map(object => {
          return(
            <a href="#"
              onClick={() => {
                this.props.setObject(object);
                this.setHistory(object.id);
              }}
            >
              <ArtObject
                key={object.id}
                title={object.title}
                people={object.people}
                medium={object.medium}
                imageUrlSmall={object.imageUrlSmall}
              />
            </a>
          );
        })}
        <ViewMoreButton />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    objects: state.objects,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    ObjectsActions,
    ObjectActions,
  ), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ArtObjectGrid);
