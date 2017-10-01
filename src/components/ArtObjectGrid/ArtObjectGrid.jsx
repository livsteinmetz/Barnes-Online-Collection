import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as EnsembleObjectsActions from '../../actions/ensembleObjects';
import * as RelatedObjectsActions from '../../actions/relatedObjects';
import * as ObjectsActions from '../../actions/objects';
import * as ObjectActions from '../../actions/object';
import * as UIActions from '../../actions/ui';
import { getArtObjectUrlFromId } from '../../helpers';
import ArtObject from '../ArtObject/ArtObject';
import ViewMoreButton from './ViewMoreButton';
import SpinnerLoader from './SpinnerLoader';
import MasonryGrid from '../MasonryGrid';
import { DEV_LOG } from '../../devLogging';

import './artObjectGrid.css';

const uniqBy = require('lodash/uniqBy');

class ArtObjectGrid extends Component {
  constructor(props) {
    super(props);

    this.getGridListElement = this.getGridListElement.bind(this);

    switch (this.props.pageType) {
      case 'visually-related':
        this.getLiveObjects = () => {return this.props.relatedObjects};
        this.fetchObjects = function(newId) {
          const fetchKey = newId || this.props.object.id;
          if (fetchKey) {
            this.props.getRelatedObjects(fetchKey);
          }
        }.bind(this);
        break;
      case 'ensemble':
        this.getLiveObjects = () => {return this.props.ensembleObjects};
        this.fetchObjects = function(newId) {
          const fetchKey = newId || this.props.object.ensembleIndex;
          if (fetchKey) {
            this.props.getEnsembleObjects(fetchKey);
          }
        }.bind(this);
        break;
      case 'landing':
      default:
        this.getLiveObjects = () => {return this.props.objects};
        this.fetchObjects = this.props.getAllObjects;
        break;
    }
  }

  // overwritten in the constructor
  getLiveObjects () {}
  fetchObjects () {}

  componentDidMount() {
    const liveObjects = this.getLiveObjects();

    // todo: do we need to check the length won't it always be zero?
    if (liveObjects.lenth) {
      debugger;
    }

    if (!liveObjects.lenth) {
      this.fetchObjects();
    }
  }

  getGridListElement(object) {
    const clickHandler = function(e) {

      // todo
      if (this.props.pageType === 'landing') {
        e.preventDefault();

        this.props.modalShow();
        this.props.getObject(object.id);
      }
    }.bind(this);

    return (
      <Link
        to={getArtObjectUrlFromId(object.id)}
        onClick={clickHandler}
        className="grid-list-el"
      >
        <ArtObject
          key={object.id}
          title={object.title}
          people={object.people}
          medium={object.medium}
          imageUrlSmall={object.imageUrlSmall}
        />
      </Link>
    );
  }

  getMasonryElements(liveObjects) {
    const objects = uniqBy(liveObjects, 'id');
    // todo: remove this dedouping if we can do it upstream instead
    const dedupedObjectLen = liveObjects.length - objects.length;

    if(dedupedObjectLen > 0) {
      DEV_LOG(`Note: ${dedupedObjectLen} objects were duplicates and removed from the masonry grid.`);
    }

    return objects.map(function(object) {
      return (
        <li key={object.id} className="masonry-grid-element">
          {this.getGridListElement(object)}
        </li>
      );
    }.bind(this));
  };

  componentWillUpdate(nextProps) {
    if (this.props.object.id !== nextProps.object.id) {
      this.fetchObjects(nextProps.object.id);
    }
  }

  render() {
    const liveObjects = this.getLiveObjects();

    const masonryElements = this.getMasonryElements(liveObjects);
    const hasElements = masonryElements.length > 0;
    const searchIsPending = this.props.objectsQuery.isPending;
    const shouldShowViewMoreBtn = this.props.pageType !== 'ensemble';
    const fadeInClass = liveObjects.length > 0 ? 'fade-in' : '';
    const isPendingClass = searchIsPending ? 'is-pending' : '';

    return (
      <div
        className={`component-art-object-grid ${fadeInClass} ${isPendingClass}`}
        data-grid-style={this.props.gridStyle}
      >
        { hasElements ?
          <div>
            <div className="component-art-object-grid-results">
              <MasonryGrid masonryElements={masonryElements} />
              { shouldShowViewMoreBtn &&
                <ViewMoreButton />
              }
            </div>
            <div className="loading-overlay">
              <SpinnerLoader />
            </div>
          </div>
        : (
          searchIsPending ?
            <SpinnerLoader />
          :
            <div className="m-block no-results">
              <img className="no-results-image" width={140} src="/images/sad-face.svg" alt="no results icon" />
              <div className="no-results-message">
                No results for this search.
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ensembleObjects: state.ensembleObjects,
    relatedObjects: state.relatedObjects,
    objects: state.objects,
    object: state.object,
    objectsQuery: state.objectsQuery,
    relatedObjectsQuery: state.relatedObjectsQuery,
    ensembleObjectsQuery: state.ensembleObjectsQuery,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    EnsembleObjectsActions,
    RelatedObjectsActions,
    ObjectsActions,
    ObjectActions,
    UIActions,
  ), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ArtObjectGrid);
