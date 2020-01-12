import React, { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';

type Props = {
  api: ApiPromise;
};

type NodeInfoType = {
  chain?: string;
  nodeName?: string;
  nodeVersion?: string;
};

export default function NodeInfo (props: Props) {
  const { api } = props;
  const [nodeInfo, setNodeInfo] = useState<NodeInfoType>({});

  useEffect(() => {
    Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ])
      .then(([_chain, _nodeName, _nodeVersion]) => {
        setNodeInfo({
          chain: _chain.toString(),
          nodeName: _nodeName.toString(),
          nodeVersion: _nodeVersion.toString()
        });
      })
      .catch((e) => console.error(e));
  }, [api.rpc.system]);

  return (
    <>
      {nodeInfo.chain} - {nodeInfo.nodeName} (v{nodeInfo.nodeVersion})
      <hr/>
    </>
  );
}
