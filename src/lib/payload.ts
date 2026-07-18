import { getPayload } from 'payload'

import config from '@payload-config'

/**
 * コンテンツ読み取り用の Payload Local API クライアント。
 * 動的データ(セッション・投票・進捗)には使わない(憲法 §5 の線引き)
 */
export const getPayloadClient = () => getPayload({ config })
