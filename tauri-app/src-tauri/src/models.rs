use serde::{Deserialize, Serialize};

/// 단어 항목. v1(웹 버전)의 `Word` 데이터 모델과 동일한 필드를 가진다.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Word {
    pub id: i64,
    pub word: String,
    pub definition: String,
    pub memorized: bool,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}
