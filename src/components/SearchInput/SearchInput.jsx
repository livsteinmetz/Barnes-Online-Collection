import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { SearchBar } from './SearchBar';
import { Dropdowns } from './Dropdowns/Dropdowns';
import { DropdownApply } from './Dropdowns/DropdownsApply';
import { addFilter } from '../../actions/filters';
import { BREAKPOINTS } from '../../constants';
import './searchInput.css';

/*
// From old mobile design.
import MediaQuery from 'react-responsive';
import { BREAKPOINTS } from '../../constants';
import MobilePanelCloseButton from '../CollectionFilters/MobilePanelCloseButton';
*/
  
class SearchInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingTerms: [], // For mobile, filters are actioned on apply.
      applyPendingTerms: null,
    };
  }

  updatePendingTerms = pendingTerms => this.setState({ pendingTerms });
  setApplyPendingTerms = applyPendingTerms => this.setState({ applyPendingTerms });

  render() {
    const { addFilter } = this.props;
    const { applyPendingTerms, pendingTerms } = this.state;

    // Spread these props in search bar regardless of device size.
    const searchBarProps = {
      hasTooltip: true,
      submit: value => addFilter({ filterType: 'search', value }),
    };

    return (
      <div>
        <div className='search'>
          <div className='search__content'>
            <MediaQuery maxDeviceWidth={BREAKPOINTS.mobile_max}>
              <SearchBar
                {...searchBarProps}
                placeholder='Search collection'
              />
              
            </MediaQuery>
            <MediaQuery minDeviceWidth={BREAKPOINTS.mobile_max + 1}>
              <SearchBar
                {...searchBarProps}
                placeholder='Search a keyword, artist, room number, and more'
              />
            </MediaQuery>
            <div className='search__dropdowns'>
              <Dropdowns
                pendingTerms={pendingTerms}
                setApplyPendingTerms={this.setApplyPendingTerms}
                updatePendingTerms={this.updatePendingTerms}
              />
            </div>
          </div>
        </div>
        <DropdownApply
          isApply={Boolean(pendingTerms && pendingTerms.length)}
          apply={applyPendingTerms}
          clear={() => this.setState({ dropdownsActive: false })}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ search: state.search });
const mapDispatchToProps = (dispatch) => (
  bindActionCreators(
    Object.assign({}, { addFilter }),
    dispatch
  )
);

export default connect(mapStateToProps, mapDispatchToProps)(SearchInput);

// /**
//  * {/* <MediaQuery maxWidth={BREAKPOINTS.tablet_max}>
//           <div className='mobile-filters-section search-input'>
//             <form className='mobile-filters-form' onSubmit={this.handleSubmit}>
//               <div className='form-field'>
//                 <input
//                   className='input mobile'
//                   type='text'
//                   value={this.state.value}
//                   placeholder='Search a keyword, artist, room number, and more'
//                   onChange={this.onChange}
//                 />
//                 <MobilePanelCloseButton />
//               </div>
//             </form>
//           </div>
//         </MediaQuery> */

//         /* <MediaQuery minWidth={BREAKPOINTS.tablet_max}> */}
//         /* </MediaQuery> */