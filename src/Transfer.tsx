import React, {useState, SyntheticEvent} from 'react';
import { KeyringInstance } from '@polkadot/keyring/types';
import { ApiPromise } from '@polkadot/api';
import { Button, Dropdown, Form, Input, DropdownProps, InputOnChangeData } from 'semantic-ui-react';

interface Props {
  api: ApiPromise,
  keyring: KeyringInstance
};

interface FormState {
  addressFrom: string,
  addressTo: string,
  amount: number
}

const initialState: FormState = {
  addressFrom: '',
  addressTo: '',
  amount: 0
}


export default function Transfer(props: Props) {
  const {api, keyring} = props;
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>('');

  // get the list of accounts we possess the private key for
  const keyringOptions = () => (
    keyring.getPairs().map((account) =>  ({
      key: account.address,
      value: account.address,
      text: account.meta.name.toUpperCase() 
    }))
  )

  const onChange = (_:SyntheticEvent<HTMLElement, Event>, data:InputOnChangeData | DropdownProps): void => {
    setFormState(formState => {
      return {
        ...formState,
        [data.state]: data.value
      }
    });
  }

  const makeTransfer = () => {
    const { addressTo, addressFrom, amount } = formState;
    const fromPair = keyring.getPair(addressFrom);

    try{
      setStatus('Sending...');

      api.tx.balances
      .transfer(addressTo, amount)
      .signAndSend(fromPair, ({ status }) => {
        if (status.type === 'Finalized') {
          setStatus(`Completed at block hash #${status.asFinalized.toString()}`);
        } else {
          setStatus(`Current transfer status: ${status.type}`);
        }
      });
    } catch (e) {
      setStatus(':( transaction failed');
      console.error('ERROR:', e);
    }
  }

  return (
    <>
      <h1>Transfer</h1>
      <Form>
        <Form.Field>
          <Dropdown
            placeholder='Select from  your accounts'
            fluid
            label="From"
            onChange={onChange}
            search
            selection
            state='addressFrom'
            options={keyringOptions()}
            value={formState.addressFrom}
          />
        </Form.Field>
        <Form.Field>
          <Input
            onChange={onChange}
            label='To'
            fluid
            placeholder='address'
            state='addressTo'
            type='text'
            value={formState.addressTo}
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='Amount'
            fluid
            onChange={onChange}
            state='amount'
            type='number'
            value={formState.amount}
          />
        </Form.Field>
        <Form.Field>
          <Button  
            onClick={makeTransfer}
            primary
            type='submit'
          >
            Send
          </Button>
          {status}
        </Form.Field>
      </Form>
    </>
  )
}