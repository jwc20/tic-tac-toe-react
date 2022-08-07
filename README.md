# tic-tac-toe-react

https://gateway.pinata.cloud/ipfs/QmNsX7S2mNXuPnseUWYSDZfTSckgcx8499E5nGvpTemzyN/


- [x] implement ipfs
  - used ipfs to host and used Pinata Cloud pinning service to persist data.
  - https://gateway.pinata.cloud/ipfs/Qmam8ordSi1xcmmHP1VoX1dm4jUHL7Nbor9XwNpY94FeHz/
  - https://medium.com/pinata/how-to-easily-host-a-website-on-ipfs-9d842b5d6a01
  - https://github.com/ipfs/papers/raw/master/ipfs-cap2pfs/ipfs-p2p-file-system.pdf

- [ ] refactor to using hooks (useState, useEffect, useRef, etc)
- [ ] implement libp2p instead of peerjs

### Extra Challenges:

- [ ] Display the location for each move in the format (col, row) in the move history list.
- [ ] Bold the currently selected item in the move list.
- [ ] Rewrite Board to use two loops to make the squares instead of hardcoding them.
- [ ] Add a toggle button that lets you sort the moves in either ascending or descending order.
- [ ] When someone wins, highlight the three squares that caused the win.
- [ ] When no one wins, display a message about the result being a draw.
