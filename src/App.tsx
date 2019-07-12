import React from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import testKeyring from '@polkadot/keyring/testing'
import { Container} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css'

import Balances from './Balances'
import Transfer from './Transfer'
  
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
    } catch (e) {
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
        <Container>
          <Balances
            api={api}
            keyring={testKeyring()}
          />
          <Transfer
            api={api}
            keyring={testKeyring()}
          />
        </Container>
      );
    } catch (e) {
      console.log(e)
    }
  }
}
