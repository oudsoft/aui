module.exports = function ( jq ) {
	const $ = jq;

  const titlePageBoxStyle = {'padding': '4px', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'};
  const orderDateBoxStyle = {'width': 'fit-content', 'display': 'inline-block', 'background-color': 'white', 'color': 'black', 'padding': '4px', 'cursor': 'pointer', 'font-size': '16px', 'border': '2px solid black'};

  return {
    titlePageBoxStyle,
		orderDateBoxStyle
	}
}
