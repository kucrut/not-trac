import qs from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ModalContainer } from 'react-router-modal';

import { set_user_credentials } from './actions';
import Avatar from './components/Avatar';
import Footer from './components/Footer';
import Header from './components/Header';
import Login from './components/Login';

import Attachment from './containers/Attachment';
import Board from './containers/Board';
import Query from './containers/Query';
import Summary from './containers/Summary';
import Ticket from './containers/Ticket';

import './App.css';
import 'react-router-modal/css/react-router-modal.css';

class App extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			user: null,
		};
	}

	componentWillMount() {
		// TEMPORARY!
		const existing = localStorage.getItem( 'trac-auth' );
		if ( existing ) {
			this.props.dispatch( set_user_credentials( JSON.parse( existing ) ) );
		}
	}

	onLogin( user, remember ) {
		this.props.dispatch( set_user_credentials( user ) );

		if ( remember ) {
			localStorage.setItem( 'trac-auth', JSON.stringify( user ) );
		}
	}

	render() {
		const { dispatch, user } = this.props;

		if ( ! user.username ) {
			return <Router>
				<div className="App">
					<Header
						title="Not Trac"
					/>
					<div className="wrapper">
						<Login
							onSubmit={ ( user, remember ) => this.onLogin( user, remember ) }
						/>
					</div>
					<Footer />
				</div>
			</Router>;
		}

		return <Router>
			<div className="App">
				<Header
					title="Not Trac"
					user={ user }
				>
					{ user ?
						<ul>
							<li>
								<Link to="/">Components</Link>
							</li>
							<li>
								<Avatar size={ 24 } user={ user.username } />
								@{ user.username }
							</li>
						</ul>
					: null }
				</Header>
				<div className="wrapper">
					<Switch>
						<Route
							exact
							path="/"
							component={ Summary }
						/>
						<Route
							exact
							path="/query"
							component={ ({ location }) => (
								<Query
									params={ qs.parse( location.search ) }
								/>
							)}
						/>
						<Route
							exact
							path="/board"
							component={ ({ location }) => (
								<Board
									params={ qs.parse( location.search ) }
								/>
							)}
						/>
						<Route
							exact
							path="/test"
							component={ ({ location }) => {
								console.log( qs.parse( location.search ) );
								return <span>Testing!</span>
							}}
						/>
						<Route
							exact
							path="/component/:name"
							render={ ({ match }) => (
								<Redirect
									to={{
										pathname: '/query',
										search: '?' + qs.stringify({
											component: match.params.name
										})
									}}
								/>
							)}
						/>
						<Route
							exact
							path="/ticket/:id"
							render={ ({ match }) => <Ticket id={ match.params.id } /> }
						/>
						<Route
							exact
							path="/attachment/ticket/:ticket/:id"
							component={ ({ match }) => (
								<Attachment
									id={ match.params.id }
									ticket={ match.params.ticket }
								/>
							)}
						/>
						<Route render={ () => (
							<div>
								<h1>404</h1>
								<p>No route matches this URL.</p>
							</div>
						)} />
					</Switch>
				</div>
				<Footer />
				<ModalContainer
					backdropClassName="react-router-modal__backdrop App-modal-backdrop"
					modalClassName="react-router-modal__modal App-modal"
				/>
			</div>
		</Router>;
	}
}

export default connect(
	({ user }) => ({ user })
)( App );
