import { combineReducers } from 'redux';
import objects from './reducers/objects';
import relatedObjects from './reducers/relatedObjects';
import object from './reducers/object';
import filterSets from './reducers/filterSets';
import mobileFilters from './reducers/mobileFilters';
import filters from './reducers/filters';
import search from './reducers/search';
import htmlClassManager from './reducers/htmlClassManager';
import prints from './reducers/prints';
import ui from './reducers/ui';
import queryResults from './reducers/queryResults';

export default combineReducers({
  object,
  objects,
  relatedObjects,
  filterSets,
  mobileFilters,
  filters,
  search,
  htmlClassManager,
  prints,
  ui,
  queryResults
});
