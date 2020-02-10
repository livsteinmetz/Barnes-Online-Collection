import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import queryString from 'query-string';
import * as ObjectsActions from './actions/objects';
import * as FilterSetsActions from './actions/filterSets';
import * as FiltersActions from './actions/filters';
import * as SearchActions from './actions/search';
import { getQueryKeywordUrl, getQueryFilterUrl } from './helpers';
import { withRouter } from 'react-router'
import { DEV_WARN } from './devLogging';

class RouterSearchQueryHelper extends Component {
  componentWillMount() {
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(null);
  }

  setInitialQueryOnLoad({ queryType, queryVal }) {
    if (queryType === 'filter') {
      let filterSelection = {};

      try {
        filterSelection = JSON.parse(queryVal);
      } catch (e) {
        DEV_WARN('invalid search syntax in the url');
      }

      this.props.setFilters(filterSelection);

    } else if (queryType === 'keyword') {
      this.props.addSearchTerm(queryVal);
    }
  }

  componentDidUpdate() {
    const {
      search,
      filters,
      location: { state: newState } // For detecting if a modal is open.
    } = this.props;

    // If a modal is open, just return;
    if (newState && newState.isModal) return;

    const { qtype: queryType, qval: queryVal } = queryString.parse(this.props.location.search);

    if (search.length) {
      if (search !== queryVal) {
        this.props.history.push(getQueryKeywordUrl(search));
      }
    } else if (filters.ordered && filters.ordered.length) {

      // Reduce and stringify filter state to compare with queryVal.
      const filtersVal = JSON.stringify({
        // Convert ordered array into object for higher ordered filters.
        ...filters.ordered.reduce((acc, filter) => ({
          ...acc, [filter.filterType]: filter.value || filter.name, // For lines and colors we just use the name and for space and light we use the value.
        }), {}),

        // Stringify advanced filters
        advancedFilters: filters.advancedFilters,
      });

      if (filtersVal !== queryVal) this.props.history.push(getQueryFilterUrl(filtersVal));
    } else if (queryType) {
      // there's no search or Filters, so the query url needs to be cleared.
      // TODO => This is firing and causing us trouble on hitting landing page.
      this.props.history.push(``);
    }
  }

  runSearchQueryOrDeferredFetch(deferredFetch) {
    const { qtype = '', qval = '' } = queryString.parse(this.props.location.search); // Destructure querystring.
    const initialQuery = ((qtype === 'filter' || qtype === 'keyword') && qval.length)
      ? {
        queryType: qtype,
        queryVal: qval,
      } : null;

    if (initialQuery) {
      this.setInitialQueryOnLoad(initialQuery);
    } else if (deferredFetch) {
      deferredFetch();
    }
  }

  render() {
    return <div className="" />
  }
}

function mapStateToProps(state) {
  return {
    modalIsOpen: state.modal.modalIsOpen,
    modal: state.modal,
    filters: state.filters,
    search: state.search,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    ObjectsActions,
    FilterSetsActions,
    FiltersActions,
    SearchActions,
  ), dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RouterSearchQueryHelper));
