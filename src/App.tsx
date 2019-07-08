import React from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import testKeyring from '@polkadot/keyring/testing'

import Balances from './Balances'
  
interface State {
    api: ApiPromise | undefined
  }

 export default class App extends React.Component {
  state: State = {
    api: undefined
  };

  async componentDidMount () {
    const provider = new WsProvider();

    // Create the API and wait until ready
    const api = await ApiPromise.create(provider);

    try {
      this.setState({api})
    }catch (e) {
        console.log(e)
    }
  }

  render () {
    const {api} = this.state;

    try {
      if (!api || !api.isReady){
        return <div>disconnected</div>
      }

      return (
        <>
        <Balances
          api={api}
          keyring={testKeyring()}
        />
        </>
      );
    } catch (e) {
      console.log(e)
    }
  }
 }
