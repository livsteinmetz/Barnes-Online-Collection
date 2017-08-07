import axios from 'axios';
import bodybuilder from 'bodybuilder';
import * as ActionTypes from '../constants';
import { resetSearchTags } from './searchTags';

const setObjects = (objects) => {
  return {
    type: ActionTypes.SET_OBJECTS,
    payload: objects
  };
}

export const getObjects = () => {
  const body = bodybuilder()
    .filter('exists', 'imageSecret')
    .from(0).size(25)
    .query('match', '_all', 'matisse')
    .build();

  return (dispatch) => {
    dispatch(resetSearchTags());
    axios.get('/api/search', {
      params: {
        // q: 'highlight:true'
        body: body,
      }
    }).then((response) => {
      console.log(response);
      const objects = response.data.hits.hits.map(object => Object.assign({}, object._source, { id: object._id }));
      dispatch(setObjects(objects));
    });
  }
};

export const findObjectsByKeyword = (query) => {
  return (dispatch) => {
    if (query === '') {
      return getObjects()(dispatch);
    }
    axios.get('/api/search', {
      params: {
        q: `_exists_:imageSecret AND _all:${query}`,
        from: 0,
        size: 25
      }
    }).then((response) => {
      const objects = response.data.hits.hits.map(object => Object.assign({}, object._source, { id: object._id }));
      dispatch(setObjects(objects));
    });
  }
}
