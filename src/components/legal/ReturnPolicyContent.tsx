// src/components/legal/ReturnPolicyContent.tsx
import React from 'react';

// Исправленная версия с закрывающими </strong> тегами
// !!! НЕ ЗАБУДЬ ПРОВЕРИТЬ ЮРИДИЧЕСКУЮ КОРРЕКТНОСТЬ И ЗАПОЛНИ [ВАЖНО] / [ВАШЕ РЕШЕНИЕ] !!!
export default function ReturnPolicyContent() {
  return (
     <>
        <div className="text-sm text-gray-700 space-y-3 leading-relaxed">

          <p className="text-xs text-gray-500">Дата последнего обновления: 15 апреля 2025 г.</p>

          <p>
            Мы в Sellio хотим, чтобы ваши покупки всегда радовали. Если по какой-либо причине товар вам не подошел, вы можете воспользоваться правом на отказ и вернуть его в течение <strong>14 календарных дней</strong> с момента фактического получения заказа (доставки в пакомат или получения от курьера/продавца), в соответствии с законодательством Латвийской Республики (ЛР) и правилами дистанционной торговли ЕС.
          </p>

          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">1. Условия для Возврата Товара Надлежащего Качества</h2>
          {/* ... (пункт 1 без изменений) ... */}
           <p>Товар надлежащего качества (т.е. без брака...) можно вернуть, если:</p>
           <ul className="list-disc list-inside space-y-1 pl-4">
             <li>Товар не был в использовании...</li>
             <li>Полностью сохранен его товарный вид...</li>
             <li>Сохранены все потребительские свойства...</li>
             <li>Сохранена оригинальная и неповрежденная упаковка...</li>
             <li>Имеется подтверждение покупки...</li>
           </ul>
           <p className="mt-3"><strong>Обратите внимание:</strong> Согласно правилам КМ ЛР Nr. 255...</p>
           <ul className="list-disc list-inside space-y-1 pl-4">
             <li><strong>[ВАЖНО: Проверьте актуальный список...]</strong></li>
             <li>(Пример!) Товары, изготовленные по индивидуальному заказу...</li>
             {/* ... (остальные примеры) ... */}
           </ul>


          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">2. Процесс Возврата</h2>
           {/* ... (пункт 2 без изменений) ... */}
           <ol className="list-decimal list-inside space-y-3 pl-4">
              <li><strong>Оформите Заявку:</strong> ...</li>
              <li><strong>Подготовьте Товар:</strong> ...</li>
              <li><strong>Отправьте Товар:</strong> [...] в течение **7 (семи)** календарных дней [...]:
                   <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                       <li><strong>Через пакомат (Omniva/DPD):</strong> ...</li>
                       <li><strong>Почтой/Курьером:</strong> Товар необходимо отправить напрямую **Продавцу**. ...</li>
                   </ul>
                   <p className="mt-2"><strong>Важно:</strong> Расходы [...] несет **покупатель**. ...</p>
               </li>
           </ol>

          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">3. Возврат Денежных Средств</h2>
           {/* ... (пункт 3 без изменений) ... */}
           <ul className="list-disc list-inside space-y-1 pl-4">
             <li>После получения [...] **Продавец** **[ВАШЕ РЕШЕНИЕ: или Sellio?]** проверит [...].</li>
             <li>Если товар соответствует [...]. Обычно [...] в течение **5-7** рабочих дней [...].</li>
             <li>Возвращается только стоимость самого товара. [...]</li>
           </ul>


          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">4. Обмен Товара</h2>
           {/* ... (пункт 4 без изменений) ... */}
           <p>В настоящее время прямой обмен товара [...] не предусмотрен. [...].</p>


          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">5. Товар Ненадлежащего Качества (Брак, Ошибка)</h2>
          <p className="mb-2">Если вы обнаружили производственный дефект, повреждение (не связанное с транспортировкой) или получили товар, который не соответствует описанию в заказе:</p>
          {/* --- ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавлены </strong> --- */}
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li><strong>Свяжитесь с нами:</strong> Как можно скорее сообщите об этом в службу поддержки Sellio (<strong>selliomanager@gmail.com</strong> или через личный кабинет), приложив фото или видео, демонстрирующие проблему, и описание ситуации.</li>
            <li><strong>Следуйте инструкциям:</strong> Наша служба поддержки (или продавец через платформу) предоставит инструкции по возврату или обмену товара ненадлежащего качества.</li>
            <li><strong>Расходы на пересылку:</strong> В случае подтвержденного брака или ошибки продавца/платформы, все расходы на обратную пересылку и (если применимо) отправку замены несет <strong>Продавец</strong> **[ВАШЕ РЕШЕНИЕ: или Sellio?]**.</li>
            <li><strong>Варианты решения:</strong> В зависимости от ситуации и законодательства ЛР вам может быть предложен ремонт, замена товара или полный возврат денежных средств (включая стоимость первоначальной доставки).</li>
          </ol>
          {/* --- КОНЕЦ ИСПРАВЛЕНИЯ --- */}

          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">6. Контакты</h2>
           {/* ... (пункт 6 без изменений) ... */}
            <p className="mb-1">[...] обращайтесь в службу поддержки:</p>
           <ul className="list-disc list-inside space-y-1 pl-4">
             <li>Email: selliomanager@gmail.com</li>
             <li>Часы работы: Рабочие дни: 10-24, Выходные: 12-20</li>
           </ul>


          <h2 className="text-lg font-semibold !mt-6 !mb-3 text-gray-900">7. Общие положения</h2>
           {/* ... (пункт 7 без изменений) ... */}
          <p>Sellio является платформой-маркетплейсом [...]</p>


          <p className="mt-6">Спасибо за покупки на Sellio!</p>

       </div>
    </>
  );
}