import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { SearchBar } from './SearchBar';
import { Dropdowns } from './Dropdowns/Dropdowns';
import { DropdownApply } from './Dropdowns/DropdownsApply';
import { addFilter } from '../../actions/filters';
import { closeFilterSet } from '../../actions/filterSets';
import { BREAKPOINTS } from '../../constants';
import './searchInput.css';

class SearchInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      applyPendingTerms: null,
      pendingTerms: [], // For mobile, filters are actioned on apply.
      hasOverlay: false, // If a dropdown has been selected.
      topOffset: 0, // Offset for overlay.
      searchValue: '', // For search term apply.
    };

    this.ref = null;
  }

  updatePendingTerms = pendingTerms => this.setState({ pendingTerms });
  setApplyPendingTerms = applyPendingTerms => this.setState({ applyPendingTerms });

  render() {
    const { addFilter, closeFilterSet } = this.props;
    const { applyPendingTerms, pendingTerms, hasOverlay, topOffset, searchValue } = this.state;

    let searchClassName = 'search';
    if (hasOverlay) searchClassName = `${searchClassName} search--active`;

    return (
      <div>
        <div
          className={searchClassName}
          ref={ref => this.ref = ref}
        >
          <div className='search__content'>
            {/** Mobile */}
            <MediaQuery maxDeviceWidth={BREAKPOINTS.mobile_max}>
              <SearchBar
                submit={(value) => {
                  addFilter({ filterType: 'search', value });
                  closeFilterSet();
                }}
                updateFilters={searchValue => this.setState({ searchValue })}
                placeholder='Search collection'
              />
              
            </MediaQuery>

            {/** Tablet */}
            <MediaQuery
              minDeviceWidth={BREAKPOINTS.mobile_max + 1}
              maxDeviceWidth={BREAKPOINTS.tablet_max}
            >
              <SearchBar
                submit={(value) => {
                  addFilter({ filterType: 'search', value });
                  closeFilterSet();
                }}
                updateFilters={searchValue => this.setState({ searchValue })}
                placeholder='Search a keyword, artist, room number, and more'
              />
            </MediaQuery>

            {/** Desktop */}
            <MediaQuery minDeviceWidth={BREAKPOINTS.tablet_max + 1}>
              <SearchBar
                autoSuggest
                submit={value => addFilter({ filterType: 'search', value })}
                placeholder='Search a keyword, artist, room number, and more'
              />
            </MediaQuery>
            <div className='search__dropdowns'>
              <MediaQuery maxDeviceWidth={BREAKPOINTS.tablet_max}>
                <Dropdowns
                  pendingTerms={pendingTerms}
                  setApplyPendingTerms={this.setApplyPendingTerms}
                  updatePendingTerms={this.updatePendingTerms}
                  topOffset={topOffset}
                  setHasOverlay={(hasOverlay) => {
                    let topOffset = 0;

                    if (this.ref) topOffset = this.ref.scrollTop; // Adjust to top to prevent cutoff
                    this.setState({ hasOverlay, topOffset }); // Change search BEM modifier.
                  }}
                />
              </MediaQuery>
              <MediaQuery minDeviceWidth={BREAKPOINTS.tablet_max + 1}>
                <Dropdowns
                  pendingTerms={pendingTerms}
                  setApplyPendingTerms={this.setApplyPendingTerms}
                  updatePendingTerms={this.updatePendingTerms}
                />
              </MediaQuery>
            </div>
          </div>
        </div>
        <DropdownApply
          isApply={Boolean((pendingTerms && pendingTerms.length) || searchValue)}
          apply={() => {
            // If apply is pressed, check for filters and search term.
            if (applyPendingTerms) applyPendingTerms();
            if (searchValue) addFilter({ filterType: 'search', value: searchValue });
            closeFilterSet(); // Close out filters on apply.
          }}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ search: state.search });
const mapDispatchToProps = dispatch => bindActionCreators(Object.assign({}, { addFilter, closeFilterSet }), dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SearchInput);
