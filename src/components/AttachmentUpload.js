import base64 from 'base64-js';
import bytes from 'bytes';
import React from 'react';

import Button from './Button';
import Spinner from './Spinner';

import './AttachmentUpload.css';

const INITIAL_STATE = {
	description: '',
	dropping: false,
	file: null,
	licenseAgree: false,
	progress: 0,
	uploading: false,
	uploadMessage: '',
};

export default class AttachmentUpload extends React.PureComponent {
	constructor( props ) {
		super( props );

		this.state = { ...INITIAL_STATE };
	}

	onUpload() {
		const { file } = this.state;

		const reader = new FileReader();

		reader.onprogress = e => {
			// e is an ProgressEvent.
			if ( ! e.lengthComputable ) {
				return;
			}

			const progress = Math.round( ( e.loaded / e.total ) * 100 );
			this.setState({ progress });
		};

		reader.onabort = function(e) {
			this.setState({
				uploading: false,
			});
			alert('File read cancelled');
		};

		reader.onload = e => {
			this.setState({
				progress: 100,
			});

			const { description } = this.state;
			const bufferView = new Uint8Array( reader.result );
			const data = base64.fromByteArray( bufferView );

			this.props.onUpload({
				data,
				description,
				filename: file.name,
			});

			// Reset state.
			this.setState({ ...INITIAL_STATE });
		};

		// Read in the file as a binary string.
		reader.readAsArrayBuffer( file );

		this.setState({
			progress: 0,
			uploading: true,
			uploadMessage: 'Reading file…',
		});
	}

	onDragOver( e ) {
		e.preventDefault();

		// Explicitly show this is a copy.
		e.dataTransfer.dropEffect = 'copy';

		this.setState({ dropping: true });
	}

	onDragLeave( e ) {
		e.preventDefault();

		this.setState({ dropping: false });
	}

	onDrop( e ) {
		e.preventDefault();

		// If there's no files, ignore it.
		if ( ! e.dataTransfer.files.length ) {
			this.setState({ dropping: false });
			return;
		}

		this.setState({
			file: e.dataTransfer.files[0],
			dropping: false
		});
	}

	render() {
		const { file, licenseAgree } = this.state;

		if ( ! file ) {
			return <div
				className={ `AttachmentUpload ${ this.state.dropping ? 'dropping' : ''}` }
				onDragOver={ e => this.onDragOver( e ) }
				onDragLeave={ e => this.onDragLeave( e ) }
				onDrop={ e => this.onDrop( e ) }
			>
				<p className="buttons">
					<label className="AttachmentUpload-uploader">
						<input
							type="file"
							onChange={ e => this.setState({ file: e.target.files[0] }) }
						/>
						<Button fake>Upload an Attachment</Button>
					</label>
					<Button>Attach a Pull Request</Button>
					<span>(Or drop files here.)</span>
				</p>
			</div>;
		}

		return <div className="AttachmentUpload">
			<p>Uploading <code>{ file.name }</code> ({ bytes( file.size ) }):</p>
			{ this.state.uploading ?
				<p className="AttachmentUpload-progress">
					<progress
						max={ 100 }
						value={ this.state.progress }
					/>

					<span>
						<Spinner />

						{ this.state.uploadMessage }
					</span>
				</p>
			:
				<div>
					<p>
						<input
							className="AttachmentUpload-description"
							placeholder="Patch description (optional)"
							type="text"
							value={ this.state.description }
							onChange={ e => this.setState({ description: e.target.value }) }
						/>
					</p>
					<p>
						<label>
							<input
								type="checkbox"
								checked={ licenseAgree }
								onChange={ e => this.setState({ licenseAgree: e.target.checked }) }
							/>

							I agree to license the attached file under the GNU
							General Public License v2 (or later).
						</label>
					</p>
					<p>
						<Button
							disabled={ ! licenseAgree }
							onClick={ () => this.onUpload() }
							primary
						>Upload to Trac</Button>
						<Button
							onClick={ () => this.setState({ ...INITIAL_STATE }) }
						>Cancel</Button>
					</p>
				</div>
			}
		</div>;
	}
}
