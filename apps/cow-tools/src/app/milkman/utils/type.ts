export enum TransactionStatus {
  ORDER_OVERVIEW = "Order overview",
  ORDER_STRATEGY = "Order strategy",
  ORDER_TWAP = "Order twap",
  ORDER_SUMMARY = "Order summary",
  TRANSACTION_ON_QUEUE = "Transaction on queue",
  MILKMAN_CREATED = "Milkman created",
  ORDER_PLACED = "Order placed",
  PARTIALLY_EXECUTED = "Partially executed",
  CANCELED = "Canceled",
  EXECUTED = "Fully executed",
  EXECUTED_AND_CANCELED = "Partially executed/canceled",
}

export enum SwapStatus {
  TRANSACTION_ON_QUEUE = "Transaction on queue",
  MILKMAN_CREATED = "Milkman created",
  ORDER_PLACED = "Order placed",
  EXECUTED = "Executed",
  CANCELED = "Canceled",
}
