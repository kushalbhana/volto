/**
 * Edit image tile.
 * @module components/manage/Tiles/Image/Edit
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { readAsDataURL } from 'promise-file-reader';
import { Button, Dimmer, Image, Loader, Message } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';

import { Icon } from '../../../../components';
import trashSVG from '../../../../icons/delete.svg';
import clearSVG from '../../../../icons/clear.svg';
import imageLeftSVG from '../../../../icons/image-left.svg';
import imageRightSVG from '../../../../icons/image-right.svg';
import imageFitSVG from '../../../../icons/image-fit.svg';
import imageFullSVG from '../../../../icons/image-full.svg';

import { createContent } from '../../../../actions';
import { getBaseUrl } from '../../../../helpers';

@injectIntl
@connect(
  state => ({
    request: state.content.create,
    content: state.content.data,
  }),
  dispatch => bindActionCreators({ createContent }, dispatch),
)
/**
 * Edit image tile class.
 * @class Edit
 * @extends Component
 */
export default class Edit extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    selected: PropTypes.bool.isRequired,
    tile: PropTypes.string.isRequired,
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    content: PropTypes.objectOf(PropTypes.any).isRequired,
    request: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    pathname: PropTypes.string.isRequired,
    onChangeTile: PropTypes.func.isRequired,
    onSelectTile: PropTypes.func.isRequired,
    onDeleteTile: PropTypes.func.isRequired,
    createContent: PropTypes.func.isRequired,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygEditor
   */
  constructor(props) {
    super(props);

    this.onUploadImage = this.onUploadImage.bind(this);
    this.state = {
      uploading: false,
    };
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  componentWillReceiveProps(nextProps) {
    if (
      this.props.request.loading &&
      nextProps.request.loaded &&
      this.state.uploading
    ) {
      this.setState({
        uploading: false,
      });
      this.props.onChangeTile(this.props.tile, {
        ...this.props.data,
        url: nextProps.content['@id'],
      });
    }
  }

  /**
   * Upload image handler
   * @method onUploadImage
   * @returns {undefined}
   */
  onUploadImage({ target }) {
    const file = target.files[0];
    this.setState({
      uploading: true,
    });
    readAsDataURL(file).then(data => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      this.props.createContent(getBaseUrl(this.props.pathname), {
        '@type': 'Image',
        image: {
          data: fields[3],
          encoding: fields[2],
          'content-type': fields[1],
          filename: file.name,
        },
      });
    });
  }

  /**
   * Align tile handler
   * @method onAlignTile
   * @param {string} align Alignment option
   * @returns {undefined}
   */
  onAlignTile(align) {
    this.props.onChangeTile(this.props.tile, {
      ...this.props.data,
      align,
    });
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    return (
      <div
        onClick={() => this.props.onSelectTile(this.props.tile)}
        className={[
          'tile',
          'image',
          'align',
          this.props.selected && 'selected',
          this.props.data.align,
        ]
          .filter(e => !!e)
          .join(' ')}
      >
        {this.props.selected && (
          <div className="toolbar">
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onAlignTile.bind(this, 'left')}
                active={this.props.data.align === 'left'}
              >
                <Icon name={imageLeftSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onAlignTile.bind(this, 'right')}
                active={this.props.data.align === 'right'}
              >
                <Icon name={imageRightSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onAlignTile.bind(this, 'center')}
                active={
                  this.props.data.align === 'center' || !this.props.data.align
                }
              >
                <Icon name={imageFitSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onAlignTile.bind(this, 'full')}
                active={this.props.data.align === 'full'}
              >
                <Icon name={imageFullSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={() =>
                  this.props.onChangeTile(this.props.tile, {
                    ...this.props.data,
                    url: '',
                  })
                }
              >
                <Icon name={clearSVG} size="24px" color="#e40166" />
              </Button>
            </Button.Group>
            <div className="separator" />
            <Button.Group>
              <Button
                icon
                basic
                onClick={() => this.props.onDeleteTile(this.props.tile)}
              >
                <Icon name={trashSVG} size="24px" color="#e40166" />
              </Button>
            </Button.Group>
          </div>
        )}
        {this.props.data.url ? (
          <p>
            <Image src={`${this.props.data.url}/@@images/image`} alt="" />
          </p>
        ) : (
          <p>
            <Message>
              {this.state.uploading && (
                <Dimmer active>
                  <Loader indeterminate>Uploading image</Loader>
                </Dimmer>
              )}
              <center>
                <h4>Image</h4>
                <p>Upload a new image</p>
                <p>
                  <label className="ui button file">
                    Browse
                    <input
                      type="file"
                      onChange={this.onUploadImage}
                      style={{ display: 'none' }}
                    />
                  </label>
                </p>
              </center>
            </Message>
          </p>
        )}
      </div>
    );
  }
}
