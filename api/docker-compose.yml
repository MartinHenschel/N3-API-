// Importa as funções 'test' e 'expect' do Playwright
import { test, expect } from '@playwright/test';

// A URL onde seu front-end está rodando (ajuste conforme necessário)
const FRONTEND_URL = 'http://localhost:8080'; // ou a porta onde você está servindo o index.html

// test.describe agrupa testes relacionados. Damos um nome ao nosso cenário.
test.describe('Jornada Completa do Usuário (CRUD)', () => {

  // A função 'test' define um caso de teste individual.
  test('Deve permitir criar, ler, atualizar e deletar um usuário', async ({ page }) => {
    // A fixture 'page' é a nossa aba do navegador, controlada pelo Playwright.

    // --- SETUP DO TESTE ---
    // Gera dados únicos para cada execução do teste para evitar conflitos.
    const uniqueId = new Date().getTime();
    const userName = `Usuário Teste ${uniqueId}`;
    const userEmail = `teste.${uniqueId}@example.com`;
    const updatedUserName = `Usuário Atualizado ${uniqueId}`;

    // --- ETAPA 1: NAVEGAÇÃO E VERIFICAÇÃO INICIAL ---
    await test.step('Navegar para a página inicial e verificar o estado inicial', async () => {
      // 1. Acessa a URL do front-end
      await page.goto(FRONTEND_URL);
      
      // 2. Verifica se o título principal da página está visível
      await expect(page.getByRole('heading', { name: 'Cadastrar Usuário' })).toBeVisible();
      
      // 3. Verifica se o formulário está presente
      await expect(page.locator('#formUsuario')).toBeVisible();
      
      // 4. Verifica se o botão está em modo "Cadastrar"
      await expect(page.locator('#btnSubmit')).toHaveText('Cadastrar');
    });

    // --- ETAPA 2: CREATE (Criação do Usuário) ---
    await test.step('Criar um novo usuário', async () => {
      // 1. Preenche os campos do formulário
      await page.locator('#nome').fill(userName);
      await page.locator('#email').fill(userEmail);
      
      // 2. Clica no botão "Cadastrar"
      await page.locator('#btnSubmit').click();

      // 3. Aguarda um pouco para a requisição ser processada
      await page.waitForTimeout(1000);

      // 4. VERIFICAÇÃO: O novo usuário deve aparecer na lista.
      const userListItem = page.locator('#listaUsuarios li').filter({ hasText: userName });
      
      await expect(userListItem).toBeVisible();
      // Verificamos também se o e-mail aparece no mesmo item da lista.
      await expect(userListItem).toContainText(userEmail);
      
      // 5. Verifica se o formulário foi limpo após o cadastro
      await expect(page.locator('#nome')).toHaveValue('');
      await expect(page.locator('#email')).toHaveValue('');
    });

    // --- ETAPA 3: UPDATE (Atualização do Usuário) ---
    await test.step('Atualizar o usuário recém-criado', async () => {
      // Reutilizamos o localizador do item da lista da etapa anterior.
      const userListItem = page.locator('#listaUsuarios li').filter({ hasText: userName });

      // 1. Clica no botão "Editar" dentro do item daquele usuário
      await userListItem.locator('button.editar').click();

      // 2. Aguarda um pouco para os dados serem carregados
      await page.waitForTimeout(500);

      // 3. VERIFICAÇÃO: O formulário deve mudar para o modo de edição
      await expect(page.locator('#btnSubmit')).toHaveText('Atualizar');
      await expect(page.locator('#cancelarEdicao')).toBeVisible();
      
      // O campo nome deve conter o nome atual do usuário.
      await expect(page.locator('#nome')).toHaveValue(userName);
      await expect(page.locator('#email')).toHaveValue(userEmail);

      // 4. Altera o nome no formulário
      await page.locator('#nome').clear();
      await page.locator('#nome').fill(updatedUserName);

      // 5. Clica no botão "Atualizar"
      await page.locator('#btnSubmit').click();
      
      // 6. Aguarda um pouco para a atualização ser processada
      await page.waitForTimeout(1000);
      
      // 7. VERIFICAÇÃO: A lista deve agora mostrar o nome atualizado.
      await expect(page.locator('#listaUsuarios li').filter({ hasText: updatedUserName })).toBeVisible();
      // O nome antigo não deve mais estar na lista.
      await expect(page.locator('#listaUsuarios li').filter({ hasText: userName })).not.toBeVisible();
      
      // 8. Verifica se o formulário voltou ao modo "Cadastrar"
      await expect(page.locator('#btnSubmit')).toHaveText('Cadastrar');
      await expect(page.locator('#cancelarEdicao')).not.toBeVisible();
    });

    // --- ETAPA 4: DELETE (Exclusão do Usuário) ---
    await test.step('Deletar o usuário atualizado', async () => {
      // Localizamos o item da lista do usuário com o nome já atualizado.
      const updatedUserListItem = page.locator('#listaUsuarios li').filter({ hasText: updatedUserName });

      // O Playwright precisa ser instruído a lidar com caixas de diálogo do navegador (como o 'confirm').
      // Este listener de evento aceitará automaticamente qualquer diálogo que aparecer.
      page.on('dialog', dialog => dialog.accept());

      // 1. Clica no botão "Excluir"
      await updatedUserListItem.locator('button.excluir').click();

      // 2. Aguarda um pouco para a exclusão ser processada
      await page.waitForTimeout(1000);

      // 3. VERIFICAÇÃO: O item do usuário deve desaparecer da lista.
      await expect(page.locator('#listaUsuarios li').filter({ hasText: updatedUserName })).not.toBeVisible();
    });

    // --- ETAPA 5: TESTE DE CANCELAMENTO DE EDIÇÃO ---
    await test.step('Testar cancelamento de edição', async () => {
      // Primeiro, vamos criar outro usuário para testar o cancelamento
      const testUserName = `Teste Cancelamento ${uniqueId}`;
      const testUserEmail = `cancelamento.${uniqueId}@example.com`;
      
      // Criar usuário
      await page.locator('#nome').fill(testUserName);
      await page.locator('#email').fill(testUserEmail);
      await page.locator('#btnSubmit').click();
      await page.waitForTimeout(1000);
      
      // Iniciar edição
      const testUserListItem = page.locator('#listaUsuarios li').filter({ hasText: testUserName });
      await testUserListItem.locator('button.editar').click();
      await page.waitForTimeout(500);
      
      // Verificar que está em modo edição
      await expect(page.locator('#btnSubmit')).toHaveText('Atualizar');
      
      // Cancelar edição
      await page.locator('#cancelarEdicao').click();
      
      // Verificar que voltou ao modo cadastrar
      await expect(page.locator('#btnSubmit')).toHaveText('Cadastrar');
      await expect(page.locator('#cancelarEdicao')).not.toBeVisible();
      await expect(page.locator('#nome')).toHaveValue('');
      await expect(page.locator('#email')).toHaveValue('');
      
      // Limpar: excluir o usuário de teste
      page.on('dialog', dialog => dialog.accept());
      await testUserListItem.locator('button.excluir').click();
      await page.waitForTimeout(1000);
    });
  });

  // Teste adicional para verificar comportamento com dados inválidos
  test('Deve validar campos obrigatórios', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Tentar enviar formulário vazio
    await page.locator('#btnSubmit').click();
    
    // Verificar se os campos obrigatórios estão sendo validados pelo HTML5
    await expect(page.locator('#nome:invalid')).toBeAttached();
    await expect(page.locator('#email:invalid')).toBeAttached();
  });

  // Teste para verificar se a lista carrega corretamente
  test('Deve carregar a lista de usuários ao abrir a página', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Verificar se o título da lista está presente
    await expect(page.getByRole('heading', { name: 'Lista de Usuários' })).toBeVisible();
    
    // Verificar se a lista (mesmo que vazia) está presente
    await expect(page.locator('#listaUsuarios')).toBeVisible();
  });
});
