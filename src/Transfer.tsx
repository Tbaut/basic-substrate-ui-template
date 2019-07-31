import React, { useState, SyntheticEvent } from 'react';
import { ApiPromise } from '@polkadot/api';
import { Keyring } from '@polkadot/ui-keyring';
import { Dropdown, Form, Input, DropdownProps, InputOnChangeData } from 'semantic-ui-react';

import TxButton from './TxButton';

interface Props {
  api: ApiPromise,
  keyring: Keyring
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
};

export default function Transfer (props: Props) {
  const { api, keyring } = props;
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>('');
  const { addressTo, addressFrom, amount } = formState;
  const fromPair = (addressFrom && keyring.getPair(addressFrom)) || undefined;
  // get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase()
  }));

  const onChange = (_:SyntheticEvent<HTMLElement, Event>, data:InputOnChangeData | DropdownProps): void => {
    setFormState(formState => {
      return {
        ...formState,
        [data.state]: data.value
      };
    });
  };

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
            options={keyringOptions}
            value={addressFrom}
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
            value={addressTo}
          />
        </Form.Field>
        <Form.Field>
          <Input
            label='Amount'
            fluid
            onChange={onChange}
            state='amount'
            type='number'
            value={amount}
          />
        </Form.Field>
        <Form.Field>
          <TxButton
            api={api}
            fromPair={fromPair}
            label={'Send'}
            params={[addressTo, amount]}
            setStatus={setStatus}
            tx={api.tx.balances.transfer}
          />
          {status}
        </Form.Field>
      </Form>
    </>
  );
}
